package io.openbas.utils;

import static io.openbas.database.model.InjectExpectationSignature.*;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAgent;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAsset;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAgent;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAgent;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.utils.AgentUtils.getActiveAgents;

import io.openbas.database.model.*;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.service.AssetToExecute;
import java.time.Instant;
import java.util.*;

public class ExpectationUtils {

  public static final String OBAS_IMPLANT = "obas-implant-";
  public static final String OBAS_IMPLANT_CALDERA = "obas-implant-caldera-";

  private ExpectationUtils() {}

  public static List<InjectExpectation> processByValidationType(
      boolean isaNewExpectationResult,
      List<InjectExpectation> childrenExpectations,
      List<InjectExpectation> parentExpectations,
      Map<Team, List<InjectExpectation>> playerByTeam) {
    List<InjectExpectation> updatedExpectations = new ArrayList<>();

    childrenExpectations.stream()
        .findAny()
        .ifPresentOrElse(
            process -> {
              boolean isValidationAtLeastOneTarget = process.isExpectationGroup();

              parentExpectations.forEach(
                  parentExpectation -> {
                    List<InjectExpectation> toProcess =
                        playerByTeam.get(parentExpectation.getTeam());
                    int playersSize = toProcess.size(); // Without Parent expectation
                    long zeroPlayerResponses =
                        toProcess.stream()
                            .filter(exp -> exp.getScore() != null)
                            .filter(exp -> exp.getScore() == 0.0)
                            .count();
                    long nullPlayerResponses =
                        toProcess.stream().filter(exp -> exp.getScore() == null).count();

                    if (isValidationAtLeastOneTarget) { // Type atLeast
                      OptionalDouble avgAtLeastOnePlayer =
                          toProcess.stream()
                              .filter(exp -> exp.getScore() != null)
                              .filter(exp -> exp.getScore() > 0.0)
                              .mapToDouble(InjectExpectation::getScore)
                              .average();
                      if (avgAtLeastOnePlayer.isPresent()) { // Any response is positive
                        parentExpectation.setScore(avgAtLeastOnePlayer.getAsDouble());
                      } else {
                        if (zeroPlayerResponses == playersSize) { // All players had failed
                          parentExpectation.setScore(0.0);
                        } else {
                          parentExpectation.setScore(null);
                        }
                      }
                    } else { // type all
                      if (nullPlayerResponses == 0) {
                        OptionalDouble avgAllPlayer =
                            toProcess.stream().mapToDouble(InjectExpectation::getScore).average();
                        parentExpectation.setScore(avgAllPlayer.getAsDouble());
                      } else {
                        if (zeroPlayerResponses == 0) {
                          parentExpectation.setScore(null);
                        } else {
                          double sumAllPlayer =
                              toProcess.stream()
                                  .filter(exp -> exp.getScore() != null)
                                  .mapToDouble(InjectExpectation::getScore)
                                  .sum();
                          parentExpectation.setScore(sumAllPlayer / playersSize);
                        }
                      }
                    }

                    if (isaNewExpectationResult) {
                      InjectExpectationResult result =
                          InjectExpectationResult.builder()
                              .sourceId("media-pressure")
                              .sourceType("media-pressure")
                              .sourceName("Media pressure read")
                              .result(Instant.now().toString())
                              .date(Instant.now().toString())
                              .score(process.getExpectedScore())
                              .build();
                      parentExpectation.getResults().add(result);
                    }

                    parentExpectation.setUpdatedAt(Instant.now());
                    updatedExpectations.add(parentExpectation);
                  });
            },
            ElementNotFoundException::new);

    return updatedExpectations;
  }

  // -- CALDERA EXPECTATIONS --

  public static List<PreventionExpectation> getPreventionExpectations(
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
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
              null,
              expectation.getExpirationTime());
      // We propagate the asset expectation to agents
      preventionExpectationList.addAll(
          ExpectationUtils.getPreventionExpectationListForCaldera(
              assetToExecute.asset(), null, executedAgents, preventionExpectation));
      // If any expectation for agent is created then we create also expectation
      // for asset
      if (!preventionExpectationList.isEmpty()) {
        returnList.add(preventionExpectation);
        returnList.addAll(preventionExpectationList);
      }
    }

    assetToExecute
        .assetGroups()
        .forEach(
            assetGroup -> {
              List<PreventionExpectation> finalPreventionExpectationList = new ArrayList<>();

              PreventionExpectation preventionExpectation =
                  preventionExpectationForAsset(
                      expectation.getScore(),
                      expectation.getName(),
                      expectation.getDescription(),
                      assetToExecute.asset(),
                      assetGroup,
                      expectation.getExpirationTime());

              // We propagate the asset expectation to agents
              finalPreventionExpectationList.addAll(
                  ExpectationUtils.getPreventionExpectationListForCaldera(
                      assetToExecute.asset(), assetGroup, executedAgents, preventionExpectation));

              // If any expectation for agent is created then we create also expectation
              // for asset
              if (!finalPreventionExpectationList.isEmpty()) {
                returnList.add(preventionExpectation);
                returnList.addAll(finalPreventionExpectationList);
              }
            });
    return returnList;
  }

  public static List<DetectionExpectation> getDetectionExpectations(
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation) {
    List<DetectionExpectation> detectionExpectationList = new ArrayList<>();
    List<DetectionExpectation> returnList = new ArrayList<>();

    if (assetToExecute.targetByInject()) {
      DetectionExpectation preventionExpectation =
          detectionExpectationForAsset(
              expectation.getScore(),
              expectation.getName(),
              expectation.getDescription(),
              assetToExecute.asset(),
              null,
              expectation.getExpirationTime());
      // We propagate the asset expectation to agents
      detectionExpectationList.addAll(
          ExpectationUtils.getDetectionExpectationListForCaldera(
              assetToExecute.asset(), null, executedAgents, preventionExpectation));
      // If any expectation for agent is created then we create also expectation
      // for asset
      if (!detectionExpectationList.isEmpty()) {
        returnList.add(preventionExpectation);
        returnList.addAll(detectionExpectationList);
      }
    }

    assetToExecute
        .assetGroups()
        .forEach(
            assetGroup -> {
              List<DetectionExpectation> finalDetectionExpectationList = new ArrayList<>();

              DetectionExpectation detectionExpectation =
                  detectionExpectationForAsset(
                      expectation.getScore(),
                      expectation.getName(),
                      expectation.getDescription(),
                      assetToExecute.asset(),
                      assetGroup,
                      expectation.getExpirationTime());

              // We propagate the asset expectation to agents
              finalDetectionExpectationList.addAll(
                  ExpectationUtils.getDetectionExpectationListForCaldera(
                      assetToExecute.asset(), assetGroup, executedAgents, detectionExpectation));

              // If any expectation for agent is created then we create also expectation
              // for asset
              if (!finalDetectionExpectationList.isEmpty()) {
                returnList.add(detectionExpectation);
                returnList.addAll(finalDetectionExpectationList);
              }
            });
    return returnList;
  }

  public static List<ManualExpectation> getManualExpectations(
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
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
              null,
              expectation.getExpirationTime());
      // We propagate the asset expectation to agents
      manualExpectationList.addAll(
          ExpectationUtils.getManualExpectationListForCaldera(
              assetToExecute.asset(), null, executedAgents, manualExpectation));
      // If any expectation for agent is created then we create also expectation
      // for asset
      if (!manualExpectationList.isEmpty()) {
        returnList.add(manualExpectation);
        returnList.addAll(manualExpectationList);
      }
    }

    assetToExecute
        .assetGroups()
        .forEach(
            assetGroup -> {
              List<ManualExpectation> finalManualExpectationList = new ArrayList<>();

              ManualExpectation manualExpectation =
                  manualExpectationForAsset(
                      expectation.getScore(),
                      expectation.getName(),
                      expectation.getDescription(),
                      assetToExecute.asset(),
                      assetGroup,
                      expectation.getExpirationTime());

              // We propagate the asset expectation to agents
              finalManualExpectationList.addAll(
                  ExpectationUtils.getManualExpectationListForCaldera(
                      assetToExecute.asset(), assetGroup, executedAgents, manualExpectation));

              // If any expectation for agent is created then we create also expectation
              // for asset
              if (!finalManualExpectationList.isEmpty()) {
                returnList.add(manualExpectation);
                returnList.addAll(finalManualExpectationList);
              }
            });
    return returnList;
  }

  public static List<PreventionExpectation> getPreventionExpectationListForCaldera(
      Asset asset,
      AssetGroup assetGroup,
      List<Agent> executedAgents,
      PreventionExpectation preventionExpectation) {
    return executedAgents.stream()
        .map(
            executedAgent ->
                preventionExpectationForAgent(
                    preventionExpectation.getScore(),
                    preventionExpectation.getName(),
                    preventionExpectation.getDescription(),
                    executedAgent.getParent(),
                    asset,
                    assetGroup,
                    preventionExpectation.getExpirationTime(),
                    computeSignatures(
                        OBAS_IMPLANT_CALDERA,
                        executedAgent.getInject().getId(),
                        executedAgent.getParent().getId())))
        .toList();
  }

  public static List<DetectionExpectation> getDetectionExpectationListForCaldera(
      Asset asset,
      AssetGroup assetGroup,
      List<Agent> executedAgents,
      DetectionExpectation detectionExpectation) {
    return executedAgents.stream()
        .map(
            executedAgent ->
                detectionExpectationForAgent(
                    detectionExpectation.getScore(),
                    detectionExpectation.getName(),
                    detectionExpectation.getDescription(),
                    executedAgent.getParent(),
                    asset,
                    assetGroup,
                    detectionExpectation.getExpirationTime(),
                    computeSignatures(
                        OBAS_IMPLANT_CALDERA,
                        executedAgent.getInject().getId(),
                        executedAgent.getParent().getId())))
        .toList();
  }

  public static List<ManualExpectation> getManualExpectationListForCaldera(
      Asset asset,
      AssetGroup assetGroup,
      List<Agent> executedAgents,
      ManualExpectation manualExpectation) {
    return executedAgents.stream()
        .map(
            executedAgent ->
                manualExpectationForAgent(
                    manualExpectation.getScore(),
                    manualExpectation.getName(),
                    manualExpectation.getDescription(),
                    executedAgent.getParent(),
                    asset,
                    assetGroup,
                    manualExpectation.getExpirationTime()))
        .toList();
  }

  // OBAS IMPLANT EXPECTATIONS

  public static List<PreventionExpectation> getPreventionExpectations(
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
              null,
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

    assetToExecute
        .assetGroups()
        .forEach(
            (assetGroup) -> {
              List<PreventionExpectation> finalPreventionExpectationList = new ArrayList<>();

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

  public static List<DetectionExpectation> getDetectionExpectations(
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

    assetToExecute
        .assetGroups()
        .forEach(
            (assetGroup) -> {
              List<DetectionExpectation> finalDetectionExpectationList = new ArrayList<>();

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

  public static List<ManualExpectation> getManualExpectations(
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

    assetToExecute
        .assetGroups()
        .forEach(
            (assetGroup) -> {
              List<ManualExpectation> finalManualExpectationList = new ArrayList<>();

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

  public static List<PreventionExpectation> getPreventionExpectationList(
      Asset asset,
      AssetGroup assetGroup,
      Inject inject,
      PreventionExpectation preventionExpectation) {
    return getActiveAgents(asset, inject).stream()
        .map(
            agent ->
                preventionExpectationForAgent(
                    preventionExpectation.getScore(),
                    preventionExpectation.getName(),
                    preventionExpectation.getDescription(),
                    agent,
                    asset,
                    assetGroup,
                    preventionExpectation.getExpirationTime(),
                    computeSignatures(OBAS_IMPLANT, inject.getId(), agent.getId())))
        .toList();
  }

  public static List<DetectionExpectation> getDetectionExpectationList(
      Asset asset,
      AssetGroup assetGroup,
      Inject inject,
      DetectionExpectation detectionExpectation) {
    return getActiveAgents(asset, inject).stream()
        .map(
            agent ->
                detectionExpectationForAgent(
                    detectionExpectation.getScore(),
                    detectionExpectation.getName(),
                    detectionExpectation.getDescription(),
                    agent,
                    asset,
                    assetGroup,
                    detectionExpectation.getExpirationTime(),
                    computeSignatures(OBAS_IMPLANT, inject.getId(), agent.getId())))
        .toList();
  }

  public static List<ManualExpectation> getManualExpectationList(
      Asset asset, AssetGroup assetGroup, Inject inject, ManualExpectation manualExpectation) {
    return getActiveAgents(asset, inject).stream()
        .map(
            agent ->
                manualExpectationForAgent(
                    manualExpectation.getScore(),
                    manualExpectation.getName(),
                    manualExpectation.getDescription(),
                    agent,
                    asset,
                    assetGroup,
                    manualExpectation.getExpirationTime()))
        .toList();
  }

  // COMPUTE SIGNATURES

  private static List<InjectExpectationSignature> computeSignatures(
      String prefixSignature, String injectId, String agentId) {
    List<InjectExpectationSignature> signatures = new ArrayList<>();

    signatures.add(
        createSignature(
            EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME,
            prefixSignature + injectId + "-agent-" + agentId));

    return signatures;
  }

  private static InjectExpectationSignature createSignature(
      String signatureType, String signatureValue) {
    return builder().type(signatureType).value(signatureValue).build();
  }
}
