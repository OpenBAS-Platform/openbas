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

  private static List<PreventionExpectation> getPreventionExpectations(
      AssetToExecute assetToExecute,
      Inject inject,
      io.openbas.model.inject.form.Expectation expectation) {
    List<PreventionExpectation> preventionExpectationList = new ArrayList<>();
    List<PreventionExpectation> returnList = new ArrayList<>();

    if (assetToExecute.targetByInject()) {
      PreventionExpectation preventionExpectation =
          preventionExpectationForAsset(
              expectation.getScore(),
              expectation.getName(),
              expectation.getDescription(),
              assetToExecute.asset(),
              null, // assetGroup usefully in front-end
              expectation.getExpirationTime());

      // We propagate the assetToExecute expectation to agents
      preventionExpectationList.addAll(
          getPreventionExpectationList(
              assetToExecute.asset(), null, inject, preventionExpectation));

      // If any expectation for agent is created then we create also expectation
      // for asset
      if (!preventionExpectationList.isEmpty()) {
        returnList.add(preventionExpectation);
        returnList.addAll(preventionExpectationList);
      }
    }

    List<PreventionExpectation> finalPreventionExpectationList = new ArrayList<>();
    assetToExecute
        .assetGroups()
        .forEach(
            (assetGroup) -> {
              PreventionExpectation preventionExpectation =
                  preventionExpectationForAsset(
                      expectation.getScore(),
                      expectation.getName(),
                      expectation.getDescription(),
                      assetToExecute.asset(),
                      assetGroup, // assetGroup usefully in front-end
                      expectation.getExpirationTime());

              // We propagate the assetToExecute expectation to agents
              finalPreventionExpectationList.addAll(
                  getPreventionExpectationList(
                      assetToExecute.asset(), assetGroup, inject, preventionExpectation));

              // If any expectation for agent is created then we create also expectation
              // for asset
              if (!finalPreventionExpectationList.isEmpty()) {
                returnList.add(preventionExpectation);
                returnList.addAll(finalPreventionExpectationList);
              }
            });

    return returnList;
  }

  private static List<DetectionExpectation> getDetectionExpectations(
      AssetToExecute assetToExecute,
      Inject inject,
      io.openbas.model.inject.form.Expectation expectation) {
    List<DetectionExpectation> detectionExpectationList = new ArrayList<>();
    List<DetectionExpectation> returnList = new ArrayList<>();

    if (assetToExecute.targetByInject()) {
      DetectionExpectation detectionExpectation =
          detectionExpectationForAsset(
              expectation.getScore(),
              expectation.getName(),
              expectation.getDescription(),
              assetToExecute.asset(),
              null, // assetGroup usefully in front-end
              expectation.getExpirationTime());

      // We propagate the assetToExecute expectation to agents
      detectionExpectationList.addAll(
          getDetectionExpectationList(assetToExecute.asset(), null, inject, detectionExpectation));

      // If any expectation for agent is created then we create also expectation
      // for asset
      if (!detectionExpectationList.isEmpty()) {
        returnList.add(detectionExpectation);
        returnList.addAll(detectionExpectationList);
      }
    }

    List<DetectionExpectation> finalDetectionExpectationList = new ArrayList<>();
    assetToExecute
        .assetGroups()
        .forEach(
            (assetGroup) -> {
              DetectionExpectation detectionExpectation =
                  detectionExpectationForAsset(
                      expectation.getScore(),
                      expectation.getName(),
                      expectation.getDescription(),
                      assetToExecute.asset(),
                      assetGroup, // assetGroup usefully in front-end
                      expectation.getExpirationTime());

              // We propagate the assetToExecute expectation to agents
              finalDetectionExpectationList.addAll(
                  getDetectionExpectationList(
                      assetToExecute.asset(), assetGroup, inject, detectionExpectation));

              // If any expectation for agent is created then we create also expectation
              // for asset
              if (!finalDetectionExpectationList.isEmpty()) {
                returnList.add(detectionExpectation);
                returnList.addAll(finalDetectionExpectationList);
              }
            });

    return returnList;
  }

  private static List<ManualExpectation> getManualExpectations(
      AssetToExecute assetToExecute,
      Inject inject,
      io.openbas.model.inject.form.Expectation expectation) {
    List<ManualExpectation> manualExpectationList = new ArrayList<>();
    List<ManualExpectation> returnList = new ArrayList<>();

    if (assetToExecute.targetByInject()) {
      ManualExpectation manualExpectation =
          manualExpectationForAsset(
              expectation.getScore(),
              expectation.getName(),
              expectation.getDescription(),
              assetToExecute.asset(),
              null, // assetGroup usefully in front-end
              expectation.getExpirationTime());

      // We propagate the assetToExecute expectation to agents
      manualExpectationList.addAll(
          getManualExpectationList(assetToExecute.asset(), null, inject, manualExpectation));

      // If any expectation for agent is created then we create also expectation
      // for asset
      if (!manualExpectationList.isEmpty()) {
        returnList.add(manualExpectation);
        returnList.addAll(manualExpectationList);
      }
    }

    List<ManualExpectation> finalManualExpectationList = new ArrayList<>();
    assetToExecute
        .assetGroups()
        .forEach(
            (assetGroup) -> {
              ManualExpectation manualExpectation =
                  manualExpectationForAsset(
                      expectation.getScore(),
                      expectation.getName(),
                      expectation.getDescription(),
                      assetToExecute.asset(),
                      assetGroup, // assetGroup usefully in front-end
                      expectation.getExpirationTime());

              // We propagate the assetToExecute expectation to agents
              finalManualExpectationList.addAll(
                  getManualExpectationList(
                      assetToExecute.asset(), assetGroup, inject, manualExpectation));

              // If any expectation for agent is created then we create also expectation
              // for asset
              if (!finalManualExpectationList.isEmpty()) {
                returnList.add(manualExpectation);
                returnList.addAll(finalManualExpectationList);
              }
            });

    return returnList;
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
