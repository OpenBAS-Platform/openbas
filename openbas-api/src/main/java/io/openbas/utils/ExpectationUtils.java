package io.openbas.utils;

import static io.openbas.database.model.InjectExpectationSignature.*;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAgent;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAgent;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAgent;
import static io.openbas.utils.AgentUtils.getActiveAgents;

import io.openbas.database.model.*;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.exception.ElementNotFoundException;
import java.time.Instant;
import java.util.*;

public class ExpectationUtils {

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

  public static List<PreventionExpectation> getPreventionExpectationListForCaldera(
      Asset asset, List<Agent> executedAgents, PreventionExpectation preventionExpectation) {
    return executedAgents.stream()
        .map(
            executedAgent ->
                preventionExpectationForAgent(
                    preventionExpectation.getScore(),
                    preventionExpectation.getName(),
                    preventionExpectation.getDescription(),
                    executedAgent.getParent(),
                    asset,
                    preventionExpectation.getExpirationTime(),
                    computeSignatures(
                        "obas-implant-caldera-",
                        executedAgent.getInject().getId(),
                        executedAgent.getParent().getId())))
        .toList();
  }

  public static List<DetectionExpectation> getDetectionExpectationListForCaldera(
      Asset asset, List<Agent> executedAgents, DetectionExpectation detectionExpectation) {
    return executedAgents.stream()
        .map(
            executedAgent ->
                detectionExpectationForAgent(
                    detectionExpectation.getScore(),
                    detectionExpectation.getName(),
                    detectionExpectation.getDescription(),
                    executedAgent.getParent(),
                    asset,
                    detectionExpectation.getExpirationTime(),
                    computeSignatures(
                        "obas-implant-caldera-",
                        executedAgent.getInject().getId(),
                        executedAgent.getParent().getId())))
        .toList();
  }

  public static List<ManualExpectation> getManualExpectationListForCaldera(
      Asset asset, List<Agent> executedAgents, ManualExpectation manualExpectation) {
    return executedAgents.stream()
        .map(
            executedAgent ->
                manualExpectationForAgent(
                    manualExpectation.getScore(),
                    manualExpectation.getName(),
                    manualExpectation.getDescription(),
                    executedAgent.getParent(),
                    asset,
                    manualExpectation.getExpirationTime()))
        .toList();
  }

  // OBAS IMPLANT EXPECTATIONS

  public static List<PreventionExpectation> getPreventionExpectationList(
      Asset asset, Inject inject, PreventionExpectation preventionExpectation) {
    return getActiveAgents(asset, inject).stream()
        .map(
            agent ->
                preventionExpectationForAgent(
                    preventionExpectation.getScore(),
                    preventionExpectation.getName(),
                    preventionExpectation.getDescription(),
                    agent,
                    asset,
                    preventionExpectation.getExpirationTime(),
                    computeSignatures("obas-implant-", inject.getId(), agent.getId())))
        .toList();
  }

  public static List<DetectionExpectation> getDetectionExpectationList(
      Asset asset, Inject inject, DetectionExpectation detectionExpectation) {
    return getActiveAgents(asset, inject).stream()
        .map(
            agent ->
                detectionExpectationForAgent(
                    detectionExpectation.getScore(),
                    detectionExpectation.getName(),
                    detectionExpectation.getDescription(),
                    agent,
                    asset,
                    detectionExpectation.getExpirationTime(),
                    computeSignatures("obas-implant-", inject.getId(), agent.getId())))
        .toList();
  }

  public static List<ManualExpectation> getManualExpectationList(
      Asset asset, Inject inject, ManualExpectation manualExpectation) {
    return getActiveAgents(asset, inject).stream()
        .map(
            agent ->
                manualExpectationForAgent(
                    manualExpectation.getScore(),
                    manualExpectation.getName(),
                    manualExpectation.getDescription(),
                    agent,
                    asset,
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
