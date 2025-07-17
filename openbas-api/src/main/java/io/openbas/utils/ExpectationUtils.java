package io.openbas.utils;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;
import static io.openbas.database.model.InjectExpectationSignature.*;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAgent;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAsset;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAgent;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAgent;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.utils.AgentUtils.getActiveAgents;
import static io.openbas.utils.VulnerabilityExpectationUtils.vulnerabilityExpectationForAgent;
import static io.openbas.utils.VulnerabilityExpectationUtils.vulnerabilityExpectationForAsset;

import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.model.expectation.VulnerabilityExpectation;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.service.AssetToExecute;
import java.time.Instant;
import java.util.*;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Stream;

public class ExpectationUtils {

  public static final String OBAS_IMPLANT = "obas-implant-";
  public static final String OBAS_IMPLANT_CALDERA = "obas-implant-caldera-";

  public static final List<EXPECTATION_TYPE> HUMAN_EXPECTATION =
      List.of(MANUAL, CHALLENGE, ARTICLE);

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

  private static <T> List<T> getExpectationForAsset(
      final AssetGroup assetGroup,
      final Function<AssetGroup, T> createExpectationForAsset,
      final BiFunction<AssetGroup, T, List<T>> getExpectationList) {
    List<T> returnList = new ArrayList<>();

    T expectation = createExpectationForAsset.apply(assetGroup);
    List<T> expectationList = getExpectationList.apply(assetGroup, expectation);

    if (!expectationList.isEmpty()) {
      returnList.add(expectation);
      returnList.addAll(expectationList);
    }

    return returnList;
  }

  private static <T> List<T> getExpectations(
      AssetToExecute assetToExecute,
      final Function<AssetGroup, T> createExpectationForAsset,
      final BiFunction<AssetGroup, T, List<T>> getExpectationList) {
    List<T> returnList = new ArrayList<>();

    if (assetToExecute.isDirectlyLinkedToInject()) {
      returnList.addAll(
          getExpectationForAsset(null, createExpectationForAsset, getExpectationList));
    }

    assetToExecute
        .assetGroups()
        .forEach(
            assetGroup ->
                returnList.addAll(
                    getExpectationForAsset(
                        assetGroup, createExpectationForAsset, getExpectationList)));

    return returnList;
  }

  // -- CALDERA EXPECTATIONS --

  public static List<PreventionExpectation> getPreventionExpectations(
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation) {
    return getExpectations(
        assetToExecute,
        (AssetGroup assetGroup) ->
            preventionExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (AssetGroup assetGroup, PreventionExpectation preventionExpectation) ->
            getPreventionExpectationListForCaldera(
                assetToExecute.asset(), assetGroup, executedAgents, preventionExpectation));
  }

  public static List<DetectionExpectation> getDetectionExpectations(
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation) {
    return getExpectations(
        assetToExecute,
        (AssetGroup assetGroup) ->
            detectionExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (AssetGroup assetGroup, DetectionExpectation detectionExpectation) ->
            getDetectionExpectationListForCaldera(
                assetToExecute.asset(), assetGroup, executedAgents, detectionExpectation));
  }

  public static List<ManualExpectation> getManualExpectations(
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation) {

    return getExpectations(
        assetToExecute,
        (AssetGroup assetGroup) ->
            manualExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (AssetGroup assetGroup, ManualExpectation manualExpectation) ->
            getManualExpectationListForCaldera(
                assetToExecute.asset(), assetGroup, executedAgents, manualExpectation));
  }

  private static List<String> getIpsFromAsset(Asset asset) {
    if (asset instanceof Endpoint endpoint) {
      return Stream.concat(
              endpoint.getIps() != null ? Stream.of(endpoint.getIps()) : Stream.empty(),
              endpoint.getSeenIp() != null ? Stream.of(endpoint.getSeenIp()) : Stream.empty())
          .toList();
    }
    return Collections.emptyList();
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
                        getIpsFromAsset(asset),
                        executedAgent.getParent().getId(),
                        List.of())))
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
                        getIpsFromAsset(asset),
                        executedAgent.getParent().getId(),
                        List.of())))
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
      io.openbas.model.inject.form.Expectation expectation,
      List<String> targetedAssetValues) {
    return getExpectations(
        assetToExecute,
        (AssetGroup assetGroup) ->
            preventionExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (AssetGroup assetGroup, PreventionExpectation preventionExpectation) ->
            getPreventionExpectationList(
                assetToExecute.asset(),
                assetGroup,
                inject,
                preventionExpectation,
                targetedAssetValues));
  }

  public static List<DetectionExpectation> getDetectionExpectations(
      AssetToExecute assetToExecute,
      Inject inject,
      io.openbas.model.inject.form.Expectation expectation,
      List<String> targetedAssetValues) {
    return getExpectations(
        assetToExecute,
        (AssetGroup assetGroup) ->
            detectionExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (AssetGroup assetGroup, DetectionExpectation detectionExpectation) ->
            getDetectionExpectationList(
                assetToExecute.asset(),
                assetGroup,
                inject,
                detectionExpectation,
                targetedAssetValues));
  }

  /**
   * Get the vulnerability type expectations at the le vell of the asset executing the inject
   *
   * @param assetToExecute
   * @param inject
   * @param expectation
   * @return List<VulnerabilityExpectation>
   */
  public static List<VulnerabilityExpectation> getVulnerabilityExpectations(
      AssetToExecute assetToExecute,
      Inject inject,
      io.openbas.model.inject.form.Expectation expectation,
      List<String> targetedAssetValues) {
    return getExpectations(
        assetToExecute,
        (AssetGroup assetGroup) ->
            vulnerabilityExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (AssetGroup assetGroup, VulnerabilityExpectation vulnerabilityExpectation) ->
            getVulnerabilityExpectationList(
                assetToExecute.asset(),
                assetGroup,
                inject,
                vulnerabilityExpectation,
                targetedAssetValues));
  }

  public static List<ManualExpectation> getManualExpectations(
      AssetToExecute assetToExecute,
      Inject inject,
      io.openbas.model.inject.form.Expectation expectation) {
    return getExpectations(
        assetToExecute,
        (AssetGroup assetGroup) ->
            manualExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (AssetGroup assetGroup, ManualExpectation manualExpectation) ->
            getManualExpectationList(
                assetToExecute.asset(), assetGroup, inject, manualExpectation));
  }

  public static List<PreventionExpectation> getPreventionExpectationList(
      Asset asset,
      AssetGroup assetGroup,
      Inject inject,
      PreventionExpectation preventionExpectation,
      List<String> targetedAssetValues) {
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
                    computeSignatures(
                        OBAS_IMPLANT,
                        inject.getId(),
                        getIpsFromAsset(asset),
                        agent.getId(),
                        targetedAssetValues)))
        .toList();
  }

  public static List<DetectionExpectation> getDetectionExpectationList(
      Asset asset,
      AssetGroup assetGroup,
      Inject inject,
      DetectionExpectation detectionExpectation,
      List<String> targetedAssetValues) {
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
                    computeSignatures(
                        OBAS_IMPLANT,
                        inject.getId(),
                        getIpsFromAsset(asset),
                        agent.getId(),
                        targetedAssetValues)))
        .toList();
  }

  public static List<VulnerabilityExpectation> getVulnerabilityExpectationList(
      Asset asset,
      AssetGroup assetGroup,
      Inject inject,
      VulnerabilityExpectation vulnerabilityExpectation,
      List<String> targetedAssetValues) {
    return getActiveAgents(asset, inject).stream()
        .map(
            agent ->
                vulnerabilityExpectationForAgent(
                    vulnerabilityExpectation.getScore(),
                    vulnerabilityExpectation.getName(),
                    vulnerabilityExpectation.getDescription(),
                    agent,
                    asset,
                    assetGroup,
                    vulnerabilityExpectation.getExpirationTime(),
                    computeSignatures(
                        OBAS_IMPLANT,
                        inject.getId(),
                        getIpsFromAsset(asset),
                        agent.getId(),
                        targetedAssetValues)))
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
      String prefixSignature,
      String injectId,
      List<String> sourceIps,
      String agentId,
      List<String> targetedAssetValues) {
    List<InjectExpectationSignature> signatures = new ArrayList<>();

    signatures.add(
        createSignature(
            EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME,
            prefixSignature + injectId + "-agent-" + agentId));

    sourceIps.forEach(
        ip -> signatures.add(createSignature(EXPECTATION_SIGNATURE_TYPE_SOURCE_IP_ADDRESS, ip)));

    targetedAssetValues.forEach(
        value -> {
          if (value.matches("\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b")) {
            signatures.add(createSignature(EXPECTATION_SIGNATURE_TYPE_TARGET_IP_ADDRESS, value));
          } else {
            signatures.add(
                createSignature(EXPECTATION_SIGNATURE_TYPE_TARGET_HOSTNAME_ADDRESS, value));
          }
        });

    return signatures;
  }

  private static InjectExpectationSignature createSignature(
      String signatureType, String signatureValue) {
    return builder().type(signatureType).value(signatureValue).build();
  }

  // --
  public static boolean isAssetGroupExpectation(InjectExpectation e) {
    return e.getAssetGroup() != null && e.getAsset() == null && e.getAgent() == null;
  }
}
