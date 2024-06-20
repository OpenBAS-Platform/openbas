package io.openbas.injectors.openbas;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Execution;
import io.openbas.database.model.InjectExpectationSignature;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.openbas.model.OpenBASImplantInjectContent;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static io.openbas.model.expectation.DetectionExpectation.detectionExpectation;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;

@Component(OpenBASImplantContract.TYPE)
@RequiredArgsConstructor
@Log
public class OpenBASImplantExecutor extends Injector {

    private final AssetGroupService assetGroupService;

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

    private List<Expectation> computeExpectationsForAsset(@NotNull final OpenBASImplantInjectContent content, @NotNull final Asset asset, final boolean expectationGroup, final List<InjectExpectationSignature> injectExpectationSignatures) {
        if (!content.getExpectations().isEmpty()) {
            return content.getExpectations().stream().flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION ->
                        Stream.of(preventionExpectationForAsset(expectation.getScore(), expectation.getName(), expectation.getDescription(), asset, expectationGroup, injectExpectationSignatures)); // expectationGroup usefully in front-end
                case DETECTION ->
                        Stream.of(detectionExpectation(expectation.getScore(), expectation.getName(), expectation.getDescription(), asset, expectationGroup, injectExpectationSignatures));
                default -> Stream.of();
            }).toList();
        }
        return List.of();
    }

    @Override
    public ExecutionProcess process(Execution execution, ExecutableInject injection) throws Exception {
        // OpenbasImplantInjectContent content = contentConvert(injection, OpenbasImplantInjectContent.class);
        // Map<Asset, Boolean> assets = this.resolveAllAssets(injection);
        // assets.keySet().stream().map(asset -> computeExpectationsForAsset(content, asset, ));
        return new ExecutionProcess(true, List.of());
    }
}
