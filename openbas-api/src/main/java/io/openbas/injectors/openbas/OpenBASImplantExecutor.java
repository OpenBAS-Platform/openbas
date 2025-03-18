package io.openbas.injectors.openbas;

import static io.openbas.database.model.ExecutionTraces.getNewErrorTrace;
import static io.openbas.model.expectation.DetectionExpectation.*;
import static io.openbas.model.expectation.ManualExpectation.*;
import static io.openbas.model.expectation.PreventionExpectation.*;
import static io.openbas.utils.ExpectationUtils.*;

import io.openbas.database.model.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.executors.Injector;
import io.openbas.injectors.openbas.model.OpenBASImplantInjectContent;
import io.openbas.model.ExecutionProcess;
import io.openbas.model.Expectation;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.inject.service.AssetToExecute;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.service.AssetGroupService;
import io.openbas.service.InjectExpectationService;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Component;

@Component(OpenBASImplantContract.TYPE)
@RequiredArgsConstructor
@Log
public class OpenBASImplantExecutor extends Injector {

  private final AssetGroupService assetGroupService;
  private final InjectExpectationService injectExpectationService;
  private final InjectService injectService;

  @Override
  public ExecutionProcess process(Execution execution, ExecutableInject injection)
      throws Exception {
    Inject inject = this.injectService.inject(injection.getInjection().getInject().getId());

    List<AssetToExecute> assetToExecutes = this.injectService.resolveAllAssetsToExecute(inject);

    // Check assetToExecutes target
    if (assetToExecutes.isEmpty()) {
      execution.addTrace(
          getNewErrorTrace(
              "Found 0 asset to execute the ability on (likely this inject does not have any target or the targeted asset is inactive and has been purged)",
              ExecutionTraceAction.COMPLETE));
    }

    // Compute expectations
    OpenBASImplantInjectContent content =
        contentConvert(injection, OpenBASImplantInjectContent.class);

    List<Expectation> expectations = new ArrayList<>();

    assetToExecutes.forEach(
        (assetToExecute) -> {
          computeExpectationsForAssetAndAgents(expectations, content, assetToExecute, inject);
        });

    List<AssetGroup> assetGroups = injection.getAssetGroups();
    assetGroups.forEach(
        (assetGroup -> computeExpectationsForAssetGroup(expectations, content, assetGroup)));

    injectExpectationService.buildAndSaveInjectExpectations(injection, expectations);

    return new ExecutionProcess(true);
  }

  // -- PRIVATE --

  /** In case of direct assetToExecute, we have an individual expectation for the assetToExecute */
  private void computeExpectationsForAssetAndAgents(
      @NotNull final List<Expectation> expectations,
      @NotNull final OpenBASImplantInjectContent content,
      @NotNull final AssetToExecute assetToExecute,
      final Inject inject) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations().stream()
              .flatMap(
                  expectation ->
                      switch (expectation.getType()) {
                        case PREVENTION ->
                            getPreventionExpectations(assetToExecute, inject, expectation).stream();
                        case DETECTION ->
                            getDetectionExpectations(assetToExecute, inject, expectation).stream();
                        case MANUAL ->
                            getManualExpectations(assetToExecute, inject, expectation).stream();
                        default -> Stream.of();
                      })
              .toList());
    }
  }

  /**
   * In case of asset group if expectation group -> we have an expectation for the group and one for
   * each asset if not expectation group -> we have an individual expectation for each asset
   */
  private void computeExpectationsForAssetGroup(
      @NotNull final List<Expectation> expectations,
      @NotNull final OpenBASImplantInjectContent content,
      @NotNull final AssetGroup assetGroup) {
    if (!content.getExpectations().isEmpty()) {
      expectations.addAll(
          content.getExpectations().stream()
              .flatMap(
                  expectation ->
                      switch (expectation.getType()) {
                        case PREVENTION -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  asset ->
                                      expectations.stream()
                                          .filter(
                                              prevExpectation ->
                                                  InjectExpectation.EXPECTATION_TYPE.PREVENTION
                                                      == prevExpectation.type())
                                          .anyMatch(
                                              prevExpectation ->
                                                  ((PreventionExpectation) prevExpectation)
                                                              .getAsset()
                                                          != null
                                                      && ((PreventionExpectation) prevExpectation)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                preventionExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.isExpectationGroup(),
                                    expectation.getExpirationTime()));
                          }
                          yield Stream.of();
                        }
                        case DETECTION -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  asset ->
                                      expectations.stream()
                                          .filter(
                                              detExpectation ->
                                                  InjectExpectation.EXPECTATION_TYPE.DETECTION
                                                      == detExpectation.type())
                                          .anyMatch(
                                              detExpectation ->
                                                  ((DetectionExpectation) detExpectation).getAsset()
                                                          != null
                                                      && ((DetectionExpectation) detExpectation)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                detectionExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.isExpectationGroup(),
                                    expectation.getExpirationTime()));
                          }
                          yield Stream.of();
                        }
                        case MANUAL -> {
                          // Verify that at least one asset in the group has been executed
                          List<Asset> assets =
                              this.assetGroupService.assetsFromAssetGroup(assetGroup.getId());
                          if (assets.stream()
                              .anyMatch(
                                  asset ->
                                      expectations.stream()
                                          .filter(
                                              manExpectation ->
                                                  InjectExpectation.EXPECTATION_TYPE.MANUAL
                                                      == manExpectation.type())
                                          .anyMatch(
                                              manExpectation ->
                                                  ((ManualExpectation) manExpectation).getAsset()
                                                          != null
                                                      && ((ManualExpectation) manExpectation)
                                                          .getAsset()
                                                          .getId()
                                                          .equals(asset.getId())))) {
                            yield Stream.of(
                                manualExpectationForAssetGroup(
                                    expectation.getScore(),
                                    expectation.getName(),
                                    expectation.getDescription(),
                                    assetGroup,
                                    expectation.getExpirationTime(),
                                    expectation.isExpectationGroup()));
                          }
                          yield Stream.of();
                        }
                        default -> Stream.of();
                      })
              .toList());
    }
  }
}
