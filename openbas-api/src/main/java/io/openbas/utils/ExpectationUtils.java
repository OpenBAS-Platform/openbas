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

  public static List<PreventionExpectation> getPreventionExpectationList(
      Asset asset,
      List<io.openbas.database.model.Agent> executedAgents,
      Payload payload,
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
                    preventionExpectation.getExpirationTime(),
                    computeSignatures(payload, executedAgent.getProcessName())))
        .toList();
  }

  public static List<DetectionExpectation> getDetectionExpectationList(
      Asset asset,
      List<io.openbas.database.model.Agent> executedAgents,
      Payload payload,
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
                    detectionExpectation.getExpirationTime(),
                    computeSignatures(payload, executedAgent.getProcessName())))
        .toList();
  }

  public static List<ManualExpectation> getManualExpectationList(
      Asset asset,
      List<io.openbas.database.model.Agent> executedAgents,
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
                    manualExpectation.getExpirationTime()))
        .toList();
  }

  private static List<InjectExpectationSignature> computeSignatures(
      Payload payload, String processName) {
    List<InjectExpectationSignature> injectExpectationSignatures = new ArrayList<>();

    if (payload != null) {
      String expectationSignatureValue = payload.getExpectationSignatureValue();
      PayloadType payloadType = payload.getTypeEnum();
      switch (payloadType) {
        case COMMAND:
          injectExpectationSignatures.add(
              builder()
                  .type(EXPECTATION_SIGNATURE_TYPE_PROCESS_NAME)
                  .value(expectationSignatureValue)
                  .build());
          break;
        case EXECUTABLE, FILE_DROP:
          injectExpectationSignatures.add(
              builder()
                  .type(EXPECTATION_SIGNATURE_TYPE_FILE_NAME)
                  .value(expectationSignatureValue)
                  .build());
          break;
        case DNS_RESOLUTION:
          injectExpectationSignatures.add(
              builder()
                  .type(EXPECTATION_SIGNATURE_TYPE_HOSTNAME)
                  .value(expectationSignatureValue)
                  .build());
          break;
        default:
          throw new UnsupportedOperationException(
              "Payload type " + payloadType + " is not supported");
      }
    } else {
      injectExpectationSignatures.add(
          builder().type(EXPECTATION_SIGNATURE_TYPE_PROCESS_NAME).value(processName).build());
    }
    return injectExpectationSignatures;
  }

  // OBAS IMPLANT EXPECTATIONS

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

  public static List<DetectionExpectation> getDetectionExpectationList(
      Asset asset, Inject inject, String payloadType, DetectionExpectation detectionExpectation) {
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
                    computeSignatures(inject.getId(), agent.getId(), payloadType)))
        .toList();
  }

  public static List<PreventionExpectation> getPreventionExpectationList(
      Asset asset, Inject inject, String payloadType, PreventionExpectation preventionExpectation) {
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
                    computeSignatures(inject.getId(), agent.getId(), payloadType)))
        .toList();
  }

  private static List<InjectExpectationSignature> computeSignatures(
      String injectId, String agentId, String payloadType) {
    List<InjectExpectationSignature> signatures = new ArrayList<>();
    List<String> knownPayloadTypes =
        Arrays.asList("Command", "Executable", "FileDrop", "DnsResolution");

    /*
     * Always add the "Parent process" signature type for the OpenBAS Implant Executor
     */
    signatures.add(
        createSignature(
            EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME,
            "obas-implant-" + injectId + "-agent-" + agentId));

    if (!knownPayloadTypes.contains(payloadType)) {
      throw new UnsupportedOperationException("Payload type " + payloadType + " is not supported");
    }
    return signatures;
  }

  private static InjectExpectationSignature createSignature(
      String signatureType, String signatureValue) {
    return builder().type(signatureType).value(signatureValue).build();
  }
}
