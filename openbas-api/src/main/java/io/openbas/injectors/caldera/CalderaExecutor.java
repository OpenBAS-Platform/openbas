package io.openbas.injectors.caldera;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.asset.AssetGroupService;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.repository.InjectRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.caldera.client.model.Ability;
import io.openbas.injectors.caldera.client.model.Agent;
import io.openbas.injectors.caldera.client.model.ExploitResult;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.model.CalderaInjectContent;
import io.openbas.injectors.caldera.service.CalderaInjectorService;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
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
import java.util.stream.StreamSupport;

import static io.openbas.database.model.InjectExpectationSignature.*;
import static io.openbas.database.model.InjectStatusExecution.*;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAsset;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAssetGroup;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAssetGroup;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAsset;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAssetGroup;
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
        // Execute inject for all assets
        if (assets.isEmpty()) {
            execution.addTrace(traceError("Found 0 asset to execute the ability on (likely this inject does not have any target or the targeted asset is inactive and has been purged)"));
        }

        List<String> asyncIds = new ArrayList<>();
        List<Expectation> expectations = new ArrayList<>();
        List<Map<String, String>> additionalFields = new ArrayList<>();

        inject.getInjectorContract().ifPresentOrElse(injectorContract -> {
            ObjectNode rawContent = injection.getInjection().getInject().getContent();
            ObjectNode contractContent = injectorContract.getConvertedContent();
            List<JsonNode> contractTextFields = StreamSupport.stream(contractContent.get("fields").spliterator(), false)
                    .filter(contractElement -> contractElement.get("type").asText().equals("text"))
                    .toList();

            if (!contractTextFields.isEmpty()) {
                contractTextFields.forEach(jsonField -> {
                    String key = jsonField.get("key").asText();
                    if (rawContent.get(key) != null) {
                        Map<String, String> additionalField = new HashMap<>();
                        additionalField.put("trait", key);
                        additionalField.put("value", rawContent.get(key).asText());
                        additionalFields.add(additionalField);
                    }
                });
            }

            String contract;
            if (injectorContract.getPayload() != null) {
                // This is a payload, need to create the ability on the fly
                List<Ability> abilities = calderaService.abilities().stream().filter(ability -> ability.getName().equals(injectorContract.getPayload().getId())).toList();
                if (!abilities.isEmpty()) {
                    calderaService.deleteAbility(abilities.getFirst());
                }
                Ability abilityToExecute = calderaService.createAbility(injectorContract.getPayload());
                contract = abilityToExecute.getAbility_id();
            } else {
                contract = injectorContract.getId();
            }
            assets.forEach((asset, aBoolean) -> {
                try {
                    Endpoint executionEndpoint = this.findAndRegisterAssetForExecution(injection.getInjection().getInject(), asset);
                    if (executionEndpoint != null) {
                        if (Arrays.stream(injectorContract.getPlatforms()).anyMatch(s -> s.equals(executionEndpoint.getPlatform()))) {
                            String result = this.calderaService.exploit(obfuscator, executionEndpoint.getExternalReference(), contract, additionalFields);
                            if (result.contains("complete")) {
                                ExploitResult exploitResult = this.calderaService.exploitResult(executionEndpoint.getExternalReference(), contract);
                                asyncIds.add(exploitResult.getLinkId());
                                execution.addTrace(traceInfo(EXECUTION_TYPE_COMMAND, exploitResult.getCommand()));
                                // Compute expectations
                                boolean isInGroup = assets.get(executionEndpoint.getParent());
                                List<InjectExpectationSignature> injectExpectationSignatures = new ArrayList<>();
                                if (injectorContract.getPayload() != null) {
                                    switch (injectorContract.getPayload().getType()) {
                                        case "Command":
                                            injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_PROCESS_NAME).value(executionEndpoint.getProcessName()).build());
                                            injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_COMMAND_LINE).value(exploitResult.getCommand()).build());
                                            break;
                                        case "Executable":
                                            Executable payloadExecutable = (Executable) Hibernate.unproxy(injectorContract.getPayload());
                                            injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_FILE_NAME).value(payloadExecutable.getExecutableFile().getName()).build());
                                            // TODO File hash
                                            break;
                                        case "FileDrop":
                                            FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(injectorContract.getPayload());
                                            injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_FILE_NAME).value(payloadFileDrop.getFileDropFile().getName()).build());
                                            // TODO File hash
                                            break;
                                        case "DnsResolution":
                                            DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(injectorContract.getPayload());
                                            injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_HOSTNAME).value(payloadDnsResolution.getHostname().split("\\r?\\n")[0]).build());
                                            break;
                                        default:
                                            throw new UnsupportedOperationException("Payload type " + injectorContract.getPayload().getType() + " is not supported");
                                    }
                                } else {
                                    injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_PROCESS_NAME).value(executionEndpoint.getProcessName()).build());
                                    injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_COMMAND_LINE).value(exploitResult.getCommand()).build());
                                }
                                computeExpectationsForAsset(expectations, content, executionEndpoint.getParent(), isInGroup, injectExpectationSignatures);
                                execution.addTrace(traceInfo("Caldera executed the ability on asset " + asset.getName() + " using " + executionEndpoint.getProcessName() + " (paw: " + executionEndpoint.getExternalReference() + ", linkID: " + exploitResult.getLinkId() + ")"));
                            } else {
                                execution.addTrace(traceError("Caldera failed to execute the ability on asset " + asset.getName() + " (" + result + ")"));
                            }
                        } else {
                            execution.addTrace(traceError("Caldera failed to execute ability on asset " + asset.getName() + " (platform is not compatible: " + executionEndpoint.getPlatform().name() + ")"));
                        }
                    } else {
                        execution.addTrace(traceError("Caldera failed to execute the ability on asset " + asset.getName() + " (temporary injector not spawned correctly)"));
                    }
                } catch (Exception e) {
                    execution.addTrace(traceError("Caldera failed to execute the ability on asset " + asset.getName() + " (" + e.getMessage() + ")"));
                    log.severe(Arrays.toString(e.getStackTrace()));
                }
            });
        },
                ()->execution.addTrace(traceError("Inject does not have a contract")));

        if (asyncIds.isEmpty()) {
            throw new UnsupportedOperationException("Caldera failed to execute the ability due to above errors");
        }

        List<AssetGroup> assetGroups = injection.getAssetGroups();
        assetGroups.forEach((assetGroup -> computeExpectationsForAssetGroup(expectations, content, assetGroup, new ArrayList<>())));
        String message = "Caldera executed the ability on " + asyncIds.size() + " asset(s)";
        execution.addTrace(traceInfo(message, asyncIds));
        return new ExecutionProcess(true, expectations);
    }

    @Override
    public InjectStatusCommandLine getCommandsLines(String externalId) {
        InjectStatusCommandLine commandLine = new InjectStatusCommandLine();
        Set<String> contents = new HashSet<>();
        Set<String> cleanCommands = new HashSet<>();
        Ability ability = calderaService.findAbilityById(externalId);
        if(ability != null) {
            ability.getExecutors().forEach(executor -> {
                if(executor.getCommand() != null && !executor.getCommand().isBlank()) {
                    contents.add(executor.getCommand());
                }
                if(executor.getCleanup() != null && !executor.getCleanup().isEmpty()) {
                    cleanCommands.addAll(executor.getCleanup());
                }
            });
        }
        commandLine.setExternalId(externalId);
        commandLine.setContent(contents.stream().toList());
        commandLine.setCleanupCommand(cleanCommands.stream().toList());
        return commandLine;
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
        Endpoint endpointForExecution = null;
        if (!asset.getType().equals("Endpoint")) {
            log.log(Level.SEVERE, "Caldera failed to execute ability on the asset because type is not supported: " + asset.getType());
            return null;
        }
        log.log(Level.INFO, "Trying to find an available executor for " + asset.getName());
        Endpoint assetEndpoint = (Endpoint) Hibernate.unproxy(asset);
        for (int i = 0; i < RETRY_NUMBER; i++) {
            // Find an executor agent matching the asset
            log.log(Level.INFO, "Listing agents...");
            List<Agent> agents = this.calderaService.agents().stream().filter(agent ->
                    agent.getExe_name().contains("implant")
                            && (now().toEpochMilli() - Time.toInstant(agent.getCreated()).toEpochMilli()) < Asset.ACTIVE_THRESHOLD
                            && (agent.getHost().equals(assetEndpoint.getHostname()) || agent.getHost().split("\\.")[0].equals(assetEndpoint.getHostname().split("\\.")[0]))
                            && Arrays.stream(assetEndpoint.getIps()).anyMatch(s -> Arrays.stream(agent.getHost_ip_addrs()).toList().contains(s))
            ).toList();
            log.log(Level.INFO, "List return with " + agents.size() + " agents");
            if (!agents.isEmpty()) {
                for (Agent agent : agents) {
                    // Check in the database if not exist
                    Optional<Endpoint> resolvedExistingEndpoint = this.endpointService.findByExternalReference(agent.getPaw());
                    if (resolvedExistingEndpoint.isEmpty()) {
                        log.log(Level.INFO, "Agent found and not present in the database, creating it...");
                        Endpoint newEndpoint = new Endpoint();
                        newEndpoint.setInject(inject);
                        newEndpoint.setParent(asset);
                        newEndpoint.setName(assetEndpoint.getName());
                        newEndpoint.setIps(assetEndpoint.getIps());
                        newEndpoint.setHostname(assetEndpoint.getHostname());
                        newEndpoint.setPlatform(assetEndpoint.getPlatform());
                        newEndpoint.setArch(assetEndpoint.getArch());
                        newEndpoint.setExternalReference(agent.getPaw());
                        newEndpoint.setExecutor(assetEndpoint.getExecutor());
                        newEndpoint.setProcessName(agent.getExe_name());
                        endpointForExecution = this.endpointService.createEndpoint(newEndpoint);
                        break;
                    }
                }
            }
            if (endpointForExecution != null) {
                break;
            }
            Thread.sleep(5000);
        }
        return endpointForExecution;
    }

    /**
     * In case of direct asset, we have an individual expectation for the asset
     */
    private void computeExpectationsForAsset(@NotNull final List<Expectation> expectations, @NotNull final CalderaInjectContent content, @NotNull final Asset asset, final boolean expectationGroup, final List<InjectExpectationSignature> injectExpectationSignatures) {
        if (!content.getExpectations().isEmpty()) {
            expectations.addAll(content.getExpectations().stream().flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION ->
                        Stream.of(preventionExpectationForAsset(expectation.getScore(), expectation.getName(), expectation.getDescription(), asset, expectationGroup, injectExpectationSignatures)); // expectationGroup usefully in front-end
                case DETECTION ->
                        Stream.of(detectionExpectationForAsset(expectation.getScore(), expectation.getName(), expectation.getDescription(), asset, expectationGroup, injectExpectationSignatures));
                case MANUAL ->
                        Stream.of(manualExpectationForAsset(expectation.getScore(), expectation.getName(), expectation.getDescription(), asset, expectationGroup));
                default -> Stream.of();
            }).toList());
        }
    }

    /**
     * In case of asset group if expectation group -> we have an expectation for the group and one for each asset if not
     * expectation group -> we have an individual expectation for each asset
     */
    private void computeExpectationsForAssetGroup(@NotNull final List<Expectation> expectations, @NotNull final CalderaInjectContent content, @NotNull final AssetGroup assetGroup, final List<InjectExpectationSignature> injectExpectationSignatures) {
        if (!content.getExpectations().isEmpty()) {
            expectations.addAll(content.getExpectations().stream().flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> EXPECTATION_TYPE.PREVENTION == e.type()).anyMatch((e) -> ((PreventionExpectation) e).getAsset() != null && ((PreventionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(preventionExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup(), injectExpectationSignatures));
                    }
                    yield Stream.of();
                }
                case DETECTION -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> EXPECTATION_TYPE.DETECTION == e.type()).anyMatch((e) -> ((DetectionExpectation) e).getAsset() != null && ((DetectionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(detectionExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup(), injectExpectationSignatures));
                    }
                    yield Stream.of();
                }
                case MANUAL -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> EXPECTATION_TYPE.MANUAL == e.type()).anyMatch((e) -> ((ManualExpectation) e).getAsset() != null && ((ManualExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(manualExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup()));
                    }
                    yield Stream.of();
                }
                default -> Stream.of();
            }).toList());
        }
    }
}
