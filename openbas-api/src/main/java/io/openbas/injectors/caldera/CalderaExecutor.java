package io.openbas.injectors.caldera;

import io.openbas.asset.AssetGroupService;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.repository.InjectRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.caldera.client.model.Agent;
import io.openbas.injectors.caldera.client.model.ExploitResult;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.model.CalderaInjectContent;
import io.openbas.injectors.caldera.service.CalderaInjectorService;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.utils.Time;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.logging.Level;
import java.util.stream.Stream;

import static io.openbas.database.model.InjectStatusExecution.*;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectation;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAssetGroup;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAssetGroup;
import static java.time.Instant.now;

@Component(CalderaContract.TYPE)
@RequiredArgsConstructor
@Log
public class CalderaExecutor extends Injector {
    private final int RETRY_NUMBER = 20;

    private final CalderaInjectorConfig config;
    private final CalderaInjectorService calderaService;
    private final EndpointService endpointService;
    private final AssetGroupService assetGroupService;
    private final InjectRepository injectRepository;

    @Override
    @Transactional
    public ExecutionProcess process(@NotNull final Execution execution, @NotNull final ExecutableInject injection) throws Exception {
        CalderaInjectContent content = contentConvert(injection, CalderaInjectContent.class);
        String obfuscator = content.getObfuscator() != null ? content.getObfuscator() : "base64";
        Inject inject = this.injectRepository.findById(injection.getInjection().getInject().getId()).orElseThrow();
        Map<Asset, Boolean> assets = this.resolveAllAssets(injection);
        List<String> asyncIds = new ArrayList<>();
        List<Expectation> expectations = new ArrayList<>();
        // Execute inject for all assets
        String contract = inject.getInjectorContract().getId();
        assets.forEach((asset, aBoolean) -> {
            try {
                Endpoint executionEndpoint = this.findAndRegisterAssetForExecution(injection.getInjection().getInject(), asset);
                if (executionEndpoint != null) {
                    this.calderaService.exploit(obfuscator, executionEndpoint.getExternalReference(), contract);
                    ExploitResult exploitResult = this.calderaService.exploitResult(executionEndpoint.getExternalReference(), contract);
                    asyncIds.add(exploitResult.getLinkId());
                    execution.addTrace(traceInfo(EXECUTION_TYPE_COMMAND, exploitResult.getCommand()));
                    // Compute expectations
                    boolean isInGroup = assets.get(executionEndpoint.getParent());
                    computeExpectationsForAsset(expectations, content, executionEndpoint.getParent(), isInGroup);
                } else {
                    execution.addTrace(traceError("Caldera failed to execute the ability because execution endpoint was not found for endpoint " + asset.getName()));
                }
            } catch (Exception e) {
                execution.addTrace(traceError("Caldera failed to execute ability on asset " + asset.getName() + " (" + e.getMessage() + ")"));
            }
        });

        List<AssetGroup> assetGroups = injection.getAssetGroups();
        assetGroups.forEach((assetGroup -> computeExpectationsForAssetGroup(expectations, content, assetGroup)));

        if (asyncIds.isEmpty()) {
            throw new UnsupportedOperationException("Caldera inject needs at least one valid asset");
        }

        String message = "Caldera execute ability on " + asyncIds.size() + " asset(s)";
        execution.addTrace(traceInfo(message, asyncIds));

        return new ExecutionProcess(true, expectations);
    }

    // -- PRIVATE --

    private Map<Asset, Boolean> resolveAllAssets(@NotNull final ExecutableInject inject) {
        Map<Asset, Boolean> assets = new HashMap<>();
        inject.getAssets().forEach((asset -> {
            assets.put(asset, false);
        }));
        inject.getAssetGroups().forEach((assetGroup -> {
            List<Asset> assetsFromGroup = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
            // Verify asset validity
            assetsFromGroup.forEach((asset) -> {
                assets.put(asset, true);
            });
        }));
        return assets;
    }

    private Endpoint findAndRegisterAssetForExecution(@NotNull final Inject inject, @NotNull final Asset asset) throws InterruptedException {
        int count = 0;
        Endpoint endpointForExecution = null;
        if (!asset.getType().equals("Endpoint")) {
            log.log(Level.SEVERE, "Caldera failed to execute ability on the asset because type is not supported: " + asset.getType());
            return null;
        }
        log.log(Level.INFO, "Trying to find an available executor for " + asset.getName());
        Endpoint assetEndpoint = (Endpoint) Hibernate.unproxy(asset);
        while (endpointForExecution == null) {
            count++;
            // Find an executor agent matching the asset
            log.log(Level.INFO, "Listing agents...");
            List<Agent> agents = this.calderaService.agents().stream().filter(agent -> agent.getExe_name().contains("executor") && (now().toEpochMilli() - Time.toInstant(agent.getCreated()).toEpochMilli()) < Asset.ACTIVE_THRESHOLD && agent.getHost().equals(assetEndpoint.getHostname()) && Arrays.stream(assetEndpoint.getIps()).anyMatch(s -> Arrays.stream(agent.getHost_ip_addrs()).toList().contains(s))).toList();
            log.log(Level.INFO, "List return with " + agents.size() + " agents");
            if (!agents.isEmpty()) {
                for (int i = 0; i < agents.size(); i++) {
                    // Check in the database if not exist
                    Optional<Endpoint> resolvedExistingEndpoint = this.endpointService.findByExternalReference(agents.get(i).getPaw());
                    if (resolvedExistingEndpoint.isEmpty()) {
                        log.log(Level.INFO, "Agent found and not present in the database, creating it...");
                        Endpoint newEndpoint = new Endpoint();
                        newEndpoint.setInject(inject);
                        newEndpoint.setParent(asset);
                        newEndpoint.setName(assetEndpoint.getName());
                        newEndpoint.setIps(assetEndpoint.getIps());
                        newEndpoint.setHostname(assetEndpoint.getHostname());
                        newEndpoint.setPlatform(assetEndpoint.getPlatform());
                        newEndpoint.setExternalReference(agents.get(i).getPaw());
                        newEndpoint.setExecutor(assetEndpoint.getExecutor());
                        endpointForExecution = this.endpointService.createEndpoint(newEndpoint);
                        break;
                    }
                }
            }
            Thread.sleep(5000);
            if (count >= RETRY_NUMBER) {
                break;
            }
        }
        return endpointForExecution;
    }

    /**
     * In case of direct asset, we have an individual expectation for the asset
     */
    private void computeExpectationsForAsset(@NotNull final List<Expectation> expectations, @NotNull final CalderaInjectContent content, @NotNull final Asset asset, final boolean expectationGroup) {
        if (!content.getExpectations().isEmpty()) {
            expectations.addAll(content.getExpectations().stream().flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION ->
                        Stream.of(preventionExpectationForAsset(expectation.getScore(), expectation.getName(), expectation.getDescription(), asset, expectationGroup)); // expectationGroup usefully in front-end
                case DETECTION ->
                        Stream.of(detectionExpectation(expectation.getScore(), expectation.getName(), expectation.getDescription(), asset, expectationGroup));
                default -> Stream.of();
            }).toList());
        }
    }

    /**
     * In case of asset group if expectation group -> we have an expectation for the group and one for each asset if not
     * expectation group -> we have an individual expectation for each asset
     */
    private void computeExpectationsForAssetGroup(@NotNull final List<Expectation> expectations, @NotNull final CalderaInjectContent content, @NotNull final AssetGroup assetGroup) {
        if (!content.getExpectations().isEmpty()) {
            expectations.addAll(content.getExpectations().stream().flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> EXPECTATION_TYPE.PREVENTION == e.type()).anyMatch((e) -> ((PreventionExpectation) e).getAsset() != null && ((PreventionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(preventionExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup()));
                    }
                    yield Stream.of();
                }
                case DETECTION -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> EXPECTATION_TYPE.DETECTION == e.type()).anyMatch((e) -> ((DetectionExpectation) e).getAsset() != null && ((DetectionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(detectionExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup()));
                    }
                    yield Stream.of();
                }
                default -> Stream.of();
            }).toList());
        }
    }
}
