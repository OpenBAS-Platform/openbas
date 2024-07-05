package io.openbas.injectors.openbas;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.openbas.model.OpenBASImplantInjectContent;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static io.openbas.database.model.InjectExpectationSignature.*;
import static io.openbas.database.model.InjectStatusExecution.traceError;
import static io.openbas.database.model.InjectStatusExecution.traceInfo;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAsset;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAssetGroup;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAsset;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAssetGroup;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAssetGroup;

@Component(OpenBASImplantContract.TYPE)
@RequiredArgsConstructor
@Log
public class OpenBASImplantExecutor extends Injector {

    private final AssetGroupService assetGroupService;
    private final InjectRepository injectRepository;
    private final InjectStatusRepository injectStatusRepository;

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

    /**
     * In case of direct asset, we have an individual expectation for the asset
     */
    private void computeExpectationsForAsset(@NotNull final List<Expectation> expectations, @NotNull final OpenBASImplantInjectContent content, @NotNull final Asset asset, final boolean expectationGroup, final List<InjectExpectationSignature> injectExpectationSignatures) {
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
    private void computeExpectationsForAssetGroup(@NotNull final List<Expectation> expectations, @NotNull final OpenBASImplantInjectContent content, @NotNull final AssetGroup assetGroup, final List<InjectExpectationSignature> injectExpectationSignatures) {
        if (!content.getExpectations().isEmpty()) {
            expectations.addAll(content.getExpectations().stream().flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> InjectExpectation.EXPECTATION_TYPE.PREVENTION == e.type()).anyMatch((e) -> ((PreventionExpectation) e).getAsset() != null && ((PreventionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(preventionExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup(), injectExpectationSignatures));
                    }
                    yield Stream.of();
                }
                case DETECTION -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> InjectExpectation.EXPECTATION_TYPE.DETECTION == e.type()).anyMatch((e) -> ((DetectionExpectation) e).getAsset() != null && ((DetectionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(detectionExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup(), injectExpectationSignatures));
                    }
                    yield Stream.of();
                }
                case MANUAL -> {
                    // Verify that at least one asset in the group has been executed
                    List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                    if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e -> InjectExpectation.EXPECTATION_TYPE.MANUAL == e.type()).anyMatch((e) -> ((ManualExpectation) e).getAsset() != null && ((ManualExpectation) e).getAsset().getId().equals(asset.getId())))) {
                        yield Stream.of(manualExpectationForAssetGroup(expectation.getScore(), expectation.getName(), expectation.getDescription(), assetGroup, expectation.isExpectationGroup()));
                    }
                    yield Stream.of();
                }
                default -> Stream.of();
            }).toList());
        }
    }

    @Override
    public ExecutionProcess process(Execution execution, ExecutableInject injection) throws Exception {
        Inject inject = this.injectRepository.findById(injection.getInjection().getInject().getId()).orElseThrow();
        Map<Asset, Boolean> assets = this.resolveAllAssets(injection);

        // Check assets target
        if (assets.isEmpty()) {
            execution.addTrace(traceError("Found 0 asset to execute the ability on (likely this inject does not have any target or the targeted asset is inactive and has been purged)"));
        }

        // Compute expectations
        OpenBASImplantInjectContent content = contentConvert(injection, OpenBASImplantInjectContent.class);

        List<Expectation> expectations = new ArrayList<>();
        assets.forEach((asset, isInGroup) -> {
            List<InjectExpectationSignature> injectExpectationSignatures = new ArrayList<>();
            if (inject.hasInjectorContract() && inject.getInjectorContract().getPayload() != null) {
                // Put the correct number in inject status
                int totalActionsCount = 0;
                switch (inject.getInjectorContract().getPayload().getType()) {
                    case "Command":
                        Command payloadCommand = (Command) Hibernate.unproxy(inject.getInjectorContract().getPayload());
                        injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_PROCESS_NAME).value("obas-implant-" + inject.getId()).build());
                        injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_COMMAND_LINE).value(payloadCommand.getContent()).build());
                        totalActionsCount = totalActionsCount + 1;
                        if(payloadCommand.getPrerequisites() != null ) {
                            totalActionsCount = totalActionsCount + payloadCommand.getPrerequisites().size();
                        }
                        if( payloadCommand.getCleanupCommand() != null ) {
                            totalActionsCount = totalActionsCount + 1;
                        }
                        break;
                    case "Executable":
                        Executable payloadExecutable = (Executable) Hibernate.unproxy(inject.getInjectorContract().getPayload());
                        injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_FILE_NAME).value(payloadExecutable.getExecutableFile().getName()).build());
                        totalActionsCount = totalActionsCount + 2;
                        if(payloadExecutable.getPrerequisites() != null ) {
                            totalActionsCount = totalActionsCount + payloadExecutable.getPrerequisites().size();
                        }
                        if( payloadExecutable.getCleanupCommand() != null ) {
                            totalActionsCount = totalActionsCount + 1;
                        }
                        // TODO File hash
                        break;
                    case "FileDrop":
                        FileDrop payloadFileDrop = (FileDrop) Hibernate.unproxy(inject.getInjectorContract().getPayload());
                        injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_FILE_NAME).value(payloadFileDrop.getFileDropFile().getName()).build());
                        totalActionsCount = totalActionsCount + 1;
                        if(payloadFileDrop.getPrerequisites() != null ) {
                            totalActionsCount = totalActionsCount + payloadFileDrop.getPrerequisites().size();
                        }
                        if( payloadFileDrop.getCleanupCommand() != null ) {
                            totalActionsCount = totalActionsCount + 1;
                        }
                        // TODO File hash
                        break;
                    case "DnsResolution":
                        DnsResolution payloadDnsResolution = (DnsResolution) Hibernate.unproxy(inject.getInjectorContract().getPayload());
                        // TODO this is only generating the signature for the first hostname
                        // Problem is: we are not supporting multiple signatures of the same type with "AND" parameters, and this can be in multiple alerts downstream in security platforms
                        // Tech pain to refine
                        injectExpectationSignatures.add(InjectExpectationSignature.builder().type(EXPECTATION_SIGNATURE_TYPE_HOSTNAME).value(payloadDnsResolution.getHostname().split("\\r?\\n")[0]).build());
                        totalActionsCount = totalActionsCount + payloadDnsResolution.getHostname().split("\\r?\\n").length;
                        if(payloadDnsResolution.getPrerequisites() != null ) {
                            totalActionsCount = totalActionsCount + payloadDnsResolution.getPrerequisites().size();
                        }
                        if( payloadDnsResolution.getCleanupCommand() != null ) {
                            totalActionsCount = totalActionsCount + 1;
                        }
                        break;
                    default:
                        throw new UnsupportedOperationException("Payload type " + inject.getInjectorContract().getPayload().getType() + " is not supported");
                }
                execution.setExpectedCount(totalActionsCount);
            }
            computeExpectationsForAsset(expectations, content, asset, isInGroup, injectExpectationSignatures);
        });
        List<AssetGroup> assetGroups = injection.getAssetGroups();
        assetGroups.forEach((assetGroup -> computeExpectationsForAssetGroup(expectations, content, assetGroup, new ArrayList<>())));
        return new ExecutionProcess(true, expectations);
    }
}
