package io.openbas.utils;

import static io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE.*;
import static io.openbas.database.model.InjectExpectationSignature.*;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAgent;
import static io.openbas.model.expectation.DetectionExpectation.detectionExpectationForAsset;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAgent;
import static io.openbas.model.expectation.ManualExpectation.manualExpectationForAsset;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAgent;
import static io.openbas.model.expectation.PreventionExpectation.preventionExpectationForAsset;
import static io.openbas.utils.VulnerabilityExpectationUtils.vulnerabilityExpectationForAgent;
import static io.openbas.utils.VulnerabilityExpectationUtils.vulnerabilityExpectationForAsset;
import static io.openbas.utils.inject_expectation_result.InjectExpectationResultUtils.buildForMediaPressure;

import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.ManualExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.model.expectation.VulnerabilityExpectation;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.service.AssetToExecute;
import jakarta.annotation.Nullable;
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
                      InjectExpectationResult result = buildForMediaPressure(process);
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
      final List<Agent> executedAgents,
      final Function<AssetGroup, T> createExpectationForAsset,
      final BiFunction<Agent, AssetGroup, T> createExpectationForAgent) {
    List<T> returnList = new ArrayList<>();

    T expectation = createExpectationForAsset.apply(assetGroup);
    List<T> expectationList =
        executedAgents.stream()
            .map(agent -> createExpectationForAgent.apply(agent, assetGroup))
            .toList();

    if (!expectationList.isEmpty()) {
      returnList.add(expectation);
      returnList.addAll(expectationList);
    }

    return returnList;
  }

  private static <T> List<T> getExpectations(
      AssetToExecute assetToExecute,
      final List<Agent> executedAgents,
      final Function<AssetGroup, T> createExpectationForAsset,
      final BiFunction<Agent, AssetGroup, T> createExpectationForAgent) {
    List<T> returnList = new ArrayList<>();

    if (assetToExecute.isDirectlyLinkedToInject()) {
      returnList.addAll(
          getExpectationForAsset(
              null, executedAgents, createExpectationForAsset, createExpectationForAgent));
    }

    assetToExecute
        .assetGroups()
        .forEach(
            assetGroup ->
                returnList.addAll(
                    getExpectationForAsset(
                        assetGroup,
                        executedAgents,
                        createExpectationForAsset,
                        createExpectationForAgent)));

    return returnList;
  }

  /**
   * Get prevention expectations by asset
   *
   * @param implantType the type of implant (e.g., OBAS_IMPLANT_CALDERA)
   * @param assetToExecute the asset to execute the expectation on
   * @param executedAgents the list of executed agents
   * @param expectation the expectation details
   * @param valueTargetedAssetsMap a map of value targeted assets
   * @param injectId the ID of the inject
   * @return a list of prevention expectations
   */
  public static List<PreventionExpectation> getPreventionExpectationsByAsset(
      String implantType,
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation,
      Map<String, Endpoint> valueTargetedAssetsMap,
      String injectId) {
    return getExpectations(
        assetToExecute,
        executedAgents,
        (AssetGroup assetGroup) ->
            preventionExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (Agent agent, AssetGroup assetGroup) ->
            preventionExpectationForAgent(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                OBAS_IMPLANT_CALDERA.equals(implantType) ? agent.getParent() : agent,
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime(),
                computeSignatures(
                    implantType,
                    OBAS_IMPLANT_CALDERA.equals(implantType) ? agent.getInject().getId() : injectId,
                    assetToExecute.asset(),
                    OBAS_IMPLANT_CALDERA.equals(implantType)
                        ? agent.getParent().getId()
                        : agent.getId(),
                    valueTargetedAssetsMap)));
  }

  /**
   * Get detection expectations by asset
   *
   * @param implantType the type of implant (e.g., OBAS_IMPLANT_CALDERA)
   * @param assetToExecute the asset to execute the expectation on
   * @param executedAgents the list of executed agents
   * @param expectation the expectation details
   * @param valueTargetedAssetsMap a map of value targeted assets
   * @param injectId the ID of the inject
   * @return a list of detection expectations
   */
  public static List<DetectionExpectation> getDetectionExpectationsByAsset(
      String implantType,
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation,
      Map<String, Endpoint> valueTargetedAssetsMap,
      String injectId) {
    return getExpectations(
        assetToExecute,
        executedAgents,
        (AssetGroup assetGroup) ->
            detectionExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (Agent agent, AssetGroup assetGroup) ->
            detectionExpectationForAgent(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                OBAS_IMPLANT_CALDERA.equals(implantType) ? agent.getParent() : agent,
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime(),
                computeSignatures(
                    implantType,
                    OBAS_IMPLANT_CALDERA.equals(implantType) ? agent.getInject().getId() : injectId,
                    assetToExecute.asset(),
                    OBAS_IMPLANT_CALDERA.equals(implantType)
                        ? agent.getParent().getId()
                        : agent.getId(),
                    valueTargetedAssetsMap)));
  }

  /**
   * Get manual expectations by asset
   *
   * @param implantType the type of implant (e.g., OBAS_IMPLANT_CALDERA)
   * @param assetToExecute the asset to execute the expectation on
   * @param executedAgents the list of executed agents
   * @param expectation the expectation details
   * @return a list of manual expectations
   */
  public static List<ManualExpectation> getManualExpectationsByAsset(
      String implantType,
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation) {
    return getExpectations(
        assetToExecute,
        executedAgents,
        (AssetGroup assetGroup) ->
            manualExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (Agent agent, AssetGroup assetGroup) ->
            manualExpectationForAgent(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                OBAS_IMPLANT_CALDERA.equals(implantType) ? agent.getParent() : agent,
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()));
  }

  /**
   * Get vulnerability expectations by asset
   *
   * @param implantType the type of implant (e.g., OBAS_IMPLANT_CALDERA)
   * @param assetToExecute the asset to execute the expectation on
   * @param executedAgents the list of executed agents
   * @param expectation the expectation details
   * @param valueTargetedAssetsMap a map of value targeted assets
   * @return a list of vulnerability expectations
   */
  public static List<VulnerabilityExpectation> getVulnerabilityExpectationsByAsset(
      String implantType,
      AssetToExecute assetToExecute,
      List<io.openbas.database.model.Agent> executedAgents,
      io.openbas.model.inject.form.Expectation expectation,
      Map<String, Endpoint> valueTargetedAssetsMap,
      @Nullable String injectId) {
    return getExpectations(
        assetToExecute,
        executedAgents,
        (AssetGroup assetGroup) ->
            vulnerabilityExpectationForAsset(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime()),
        (Agent agent, AssetGroup assetGroup) ->
            vulnerabilityExpectationForAgent(
                expectation.getScore(),
                expectation.getName(),
                expectation.getDescription(),
                OBAS_IMPLANT_CALDERA.equals(implantType) ? agent.getParent() : agent,
                assetToExecute.asset(),
                assetGroup,
                expectation.getExpirationTime(),
                computeSignatures(
                    implantType,
                    OBAS_IMPLANT_CALDERA.equals(implantType) ? agent.getInject().getId() : injectId,
                    assetToExecute.asset(),
                    OBAS_IMPLANT_CALDERA.equals(implantType)
                        ? agent.getParent().getId()
                        : agent.getId(),
                    valueTargetedAssetsMap)));
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

  // COMPUTE SIGNATURES

  private static List<InjectExpectationSignature> computeSignatures(
      String prefixSignature,
      String injectId,
      Asset sourceAsset,
      String agentId,
      Map<String, Endpoint> valueTargetedAssetsMap) {
    List<InjectExpectationSignature> signatures = new ArrayList<>();

    signatures.add(
        new InjectExpectationSignature(
            EXPECTATION_SIGNATURE_TYPE_PARENT_PROCESS_NAME,
            prefixSignature + injectId + "-agent-" + agentId));

    getIpsFromAsset(sourceAsset)
        .forEach(ip -> signatures.add(InjectExpectationSignature.createIpSignature(ip, false)));

    valueTargetedAssetsMap.forEach(
        (value, endpoint) -> {
          if (value.equals(endpoint.getHostname())) {
            signatures.add(InjectExpectationSignature.createHostnameSignature(value));
          } else {
            signatures.add(InjectExpectationSignature.createIpSignature(value, true));
          }
        });

    return signatures;
  }

  // -- AGENT --

  public static boolean isAgentExpectation(InjectExpectation e) {
    return e.getAgent() != null;
  }

  // -- ASSET --

  public static boolean isAssetExpectation(InjectExpectation e) {
    return e.getAsset() != null && e.getAgent() == null;
  }

  // -- ASSET GROUP --

  public static boolean isAssetGroupExpectation(InjectExpectation e) {
    return e.getAssetGroup() != null && e.getAsset() == null && e.getAgent() == null;
  }
}
