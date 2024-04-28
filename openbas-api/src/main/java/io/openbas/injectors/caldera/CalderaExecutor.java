package io.openbas.injectors.caldera;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Execution;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.repository.InjectRepository;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.Injector;
import io.openbas.injectors.caldera.client.model.ExploitResult;
import io.openbas.injectors.caldera.config.CalderaInjectorConfig;
import io.openbas.injectors.caldera.model.CalderaInjectContent;
import io.openbas.injectors.caldera.service.CalderaInjectorService;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.stream.Stream;

import static io.openbas.database.model.InjectStatusExecution.EXECUTION_TYPE_COMMAND;
import static io.openbas.database.model.InjectStatusExecution.traceInfo;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectation;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAssetGroup;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAssetGroup;

@Component(CalderaContract.TYPE)
@RequiredArgsConstructor
@Log
public class CalderaExecutor extends Injector {

  private final CalderaInjectorConfig config;
  private final CalderaInjectorService calderaService;
  private final AssetGroupService assetGroupService;
  private final InjectRepository injectRepository;

  @Override
  @Transactional
  public ExecutionProcess process(@NotNull final Execution execution, @NotNull final ExecutableInject injection)
      throws Exception {
    CalderaInjectContent content = contentConvert(injection, CalderaInjectContent.class);
    String obfuscator = content.getObfuscator();

    Inject inject = this.injectRepository.findById(injection.getInjection().getInject().getId()).orElseThrow();

    Map<Asset, Boolean> assets = this.computeValidAsset(inject);

    List<String> asyncIds = new ArrayList<>();
    List<Expectation> expectations = new ArrayList<>();

    // Execute inject for all assets
    Map<String, Asset> paws = computePaws(assets.keySet().stream().toList());
    String contract = inject.getInjectorContract().getId();
    for (Map.Entry<String, Asset> entryPaw : paws.entrySet()) {
      try {
        this.calderaService.exploit(obfuscator, entryPaw.getKey(), contract);
        ExploitResult exploitResult = this.calderaService.exploitResult(entryPaw.getKey(), contract);
        asyncIds.add(exploitResult.getLinkId());
        execution.addTrace(traceInfo(EXECUTION_TYPE_COMMAND, exploitResult.getCommand()));

        // Compute expectations
        boolean isInGroup = assets.get(entryPaw.getValue());
        computeExpectationsForAsset(expectations, content, entryPaw.getValue(), isInGroup);
      } catch (Exception e) {
        log.log(Level.SEVERE, "Caldera failed to execute ability on asset " + entryPaw.getValue().getId(),
            e.getMessage());
      }
    }

    List<AssetGroup> assetGroups = inject.getAssetGroups();
    assetGroups.forEach((assetGroup -> computeExpectationsForAssetGroup(expectations, content, assetGroup)));

    if (asyncIds.isEmpty()) {
      throw new UnsupportedOperationException("Caldera inject needs at least one valid asset");
    }

    String message = "Caldera execute ability on " + asyncIds.size() + " asset(s)";
    execution.addTrace(traceInfo(message, asyncIds));

    return new ExecutionProcess(true, expectations);
  }

  // -- PRIVATE --

  private Map<Asset, Boolean> computeValidAsset(@NotNull final Inject inject) {
    Map<Asset, Boolean> assets = new HashMap<>();
    inject.getAssets().forEach((asset -> {
      // Verify asset validity
      asset.getSources().keySet().forEach((key) -> {
        if (this.config.getCollectorIds().contains(key)) {
          assets.put(asset, false);
        }
      });
    }));

    inject.getAssetGroups().forEach((assetGroup -> {
      List<Asset> assetsFromGroup = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
      // Verify asset validity
      assetsFromGroup.forEach((asset) -> {
        asset.getSources().keySet().forEach((key) -> {
          if (this.config.getCollectorIds().contains(key)) {
            assets.put(asset, true);
          }
        });
      });
    }));
    return assets;
  }

  private Map<String, Asset> computePaws(@NotNull final List<Asset> assets) {
    Map<String, Asset> paws = new HashMap<>();
    assets.forEach((asset) -> {
      asset.getSources().keySet().forEach((key) -> {
        if (this.config.getCollectorIds().contains(key)) {
          paws.put(asset.getSources().get(key), asset);
        }
      });
    });
    return paws;
  }

  /**
   * In case of direct asset, we have an individual expectation for the asset
   */
  private void computeExpectationsForAsset(
      @NotNull final List<Expectation> expectations,
      @NotNull final CalderaInjectContent content,
      @NotNull final Asset asset,
      final boolean expectationGroup) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations()
              .stream()
              .flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION -> Stream.of(preventionExpectationForAsset(expectation.getScore(), asset,
                    expectationGroup)); // expectationGroup usefully in front-end
                case DETECTION -> Stream.of(detectionExpectation(expectation.getScore(), asset, expectationGroup));
                default -> Stream.of();
              })
              .toList()
      );
    }
  }

  /**
   * In case of asset group if expectation group -> we have an expectation for the group and one for each asset if not
   * expectation group -> we have an individual expectation for each asset
   */
  private void computeExpectationsForAssetGroup(
      @NotNull final List<Expectation> expectations,
      @NotNull final CalderaInjectContent content,
      @NotNull final AssetGroup assetGroup) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations()
              .stream()
              .flatMap((expectation) -> switch (expectation.getType()) {
                case PREVENTION -> {
                  // Verify that at least one asset in the group has been executed
                  List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                  if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e->EXPECTATION_TYPE.PREVENTION == e.type())
                      .anyMatch((e) -> ((PreventionExpectation) e).getAsset() != null && ((PreventionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                    yield Stream.of(preventionExpectationForAssetGroup(expectation.getScore(), assetGroup,
                        expectation.isExpectationGroup()));
                  }
                  yield Stream.of();
                }
                case DETECTION -> {
                  // Verify that at least one asset in the group has been executed
                  List<Asset> assets = this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                  if (assets.stream().anyMatch((asset) -> expectations.stream().filter(e->EXPECTATION_TYPE.DETECTION == e.type())
                      .anyMatch((e) -> ((DetectionExpectation) e).getAsset() != null &&  ((DetectionExpectation) e).getAsset().getId().equals(asset.getId())))) {
                    yield Stream.of(detectionExpectationForAssetGroup(expectation.getScore(), assetGroup,
                        expectation.isExpectationGroup()));
                  }
                  yield Stream.of();
                }
                default -> Stream.of();
              })
              .toList()
      );
    }
  }
}
