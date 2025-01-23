package io.openbas.utils;

import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.raw.*;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.atomic_testing.form.InjectTargetWithResult;
import jakarta.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;

public class AtomicTestingUtils {

  public static final String ENDPOINT = "Endpoint";

  // -- TARGETS WITH RESULTS --
  public static List<InjectTargetWithResult> getTargetsWithResultsFromRaw(
      List<RawInjectExpectation> expectations,
      Map<String, RawTeam> rawTeamMap,
      Map<String, RawUser> rawUserMap,
      Map<String, RawAsset> rawAssetMap,
      Map<String, RawAssetGroup> rawAssetGroupMap,
      Map<String, List<Endpoint>> dynamicAssetGroupMap) {

    // Get expectations with default values
    List<ExpectationResultsByType> defaultExpectationResultsByTypes =
        getDefaultExpectationResultsByTypes();

    List<RawInjectExpectation> teamExpectations = new ArrayList<>();
    List<RawInjectExpectation> playerExpectations = new ArrayList<>();
    List<RawInjectExpectation> assetExpectations = new ArrayList<>();
    List<RawInjectExpectation> assetGroupExpectations = new ArrayList<>();
    List<String> injectAssetIds = new ArrayList<>();

    // Loop through the expectations to separate them by target
    expectations.forEach(
        expectation -> {
          if (expectation.getTeam_id() != null) {
            if (expectation.getUser_id() != null) {
              playerExpectations.add(expectation);
            } else {
              teamExpectations.add(expectation);
            }
          }
          if (expectation.getAsset_id() != null && expectation.getAgent_id() == null) {
            assetExpectations.add(expectation);
          }
          if (expectation.getAsset_group_id() != null
              && expectation.getAsset_id() == null
              && expectation.getAgent_id() == null) {
            assetGroupExpectations.add(expectation);
          }
        });

    // Build a map from the previous expectations list using targetId as the key
    Map<String, RawInjectExpectation> teamExpectationMap = new LinkedHashMap<>();
    teamExpectations.stream()
        .filter(expectation -> !teamExpectationMap.containsKey(expectation.getTeam_id()))
        .forEach(expectation -> teamExpectationMap.put(expectation.getTeam_id(), expectation));

    Map<String, RawInjectExpectation> assetExpectationMap = new LinkedHashMap<>();
    assetExpectations.stream()
        .filter(expectation -> !assetExpectationMap.containsKey(expectation.getAsset_id()))
        .forEach(expectation -> assetExpectationMap.put(expectation.getAsset_id(), expectation));

    Map<String, RawInjectExpectation> assetGroupExpectationMap = new LinkedHashMap<>();
    assetGroupExpectations.stream()
        .filter(
            expectation -> !assetGroupExpectationMap.containsKey(expectation.getAsset_group_id()))
        .forEach(
            expectation ->
                assetGroupExpectationMap.put(expectation.getAsset_group_id(), expectation));

    // Results
    List<InjectTargetWithResult> targets = new ArrayList<>();
    List<InjectTargetWithResult> assetsToRefine = new ArrayList<>();

    // Players
    Map<String, Map<String, List<RawInjectExpectation>>> groupedByTeamAndUser =
        playerExpectations.stream()
            .collect(
                Collectors.groupingBy(
                    RawInjectExpectation::getTeam_id,
                    Collectors.groupingBy(RawInjectExpectation::getUser_id)));

    // Check if each team defined in an inject has an expectation. If not, create a result with
    // default expectations
    if (rawTeamMap != null) {
      rawTeamMap.forEach(
          (teamId, team) -> {
            // Check if there are no expectations matching the current team
            boolean noMatchingExpectations =
                teamExpectations.stream().noneMatch(exp -> exp.getTeam_id().equals(teamId));

            if (noMatchingExpectations) {
              InjectTargetWithResult target =
                  new InjectTargetWithResult(
                      TargetType.TEAMS,
                      team.getTeam_id(),
                      team.getTeam_name(),
                      defaultExpectationResultsByTypes,
                      null);
              targets.add(target);
            }
          });
    }

    // Check if each asset defined in an inject has an expectation. If not, create a result with
    // default expectations
    if (rawAssetMap != null) {
      rawAssetMap.forEach(
          (assetId, asset) -> {
            // Check if there are no expectations matching the current asset
            boolean noMatchingExpectations =
                assetExpectations.stream()
                    .noneMatch(exp -> exp.getAsset_id().equals(asset.getAsset_id()));

            if (noMatchingExpectations) {
              InjectTargetWithResult target =
                  new InjectTargetWithResult(
                      TargetType.ASSETS,
                      asset.getAsset_id(),
                      asset.getAsset_name(),
                      defaultExpectationResultsByTypes,
                      Objects.equals(asset.getAsset_type(), ENDPOINT)
                          ? Endpoint.PLATFORM_TYPE.valueOf(asset.getEndpoint_platform())
                          : null);

              targets.add(target);
              injectAssetIds.add(assetId);
            }
          });
    }

    // Check if each asset group defined in an inject has an expectation. If not, create a result
    // with default expectations
    if (rawAssetGroupMap != null) {
      rawAssetGroupMap.forEach(
          (groupId, assetGroup) -> {
            // Check if there are no expectations matching the current asset group
            boolean noMatchingExpectations =
                assetGroupExpectations.stream()
                    .noneMatch(
                        exp -> exp.getAsset_group_id().equals(assetGroup.getAsset_group_id()));

            List<InjectTargetWithResult> children = new ArrayList<>();

            // Process each asset in the asset group
            assetGroup
                .getAsset_ids()
                .forEach(
                    assetId -> {
                      RawAsset finalAsset = rawAssetMap.get(assetId);
                      if (finalAsset != null) {
                        children.add(
                            new InjectTargetWithResult(
                                TargetType.ASSETS,
                                assetId,
                                finalAsset.getAsset_name(),
                                defaultExpectationResultsByTypes,
                                Objects.equals(finalAsset.getAsset_type(), ENDPOINT)
                                    ? Endpoint.PLATFORM_TYPE.valueOf(
                                        finalAsset.getEndpoint_platform())
                                    : null));
                      }
                    });

            // Add dynamic assets as children
            if (dynamicAssetGroupMap.containsKey(assetGroup.getAsset_group_id())) {
              dynamicAssetGroupMap
                  .get(assetGroup.getAsset_group_id())
                  .forEach(
                      dynamicAsset ->
                          children.add(
                              new InjectTargetWithResult(
                                  TargetType.ASSETS,
                                  dynamicAsset.getId(),
                                  dynamicAsset.getName(),
                                  defaultExpectationResultsByTypes,
                                  Objects.equals(dynamicAsset.getType(), ENDPOINT)
                                      ? Endpoint.PLATFORM_TYPE.valueOf(
                                          String.valueOf(dynamicAsset.getPlatform()))
                                      : null)));
            }

            if (noMatchingExpectations) {
              InjectTargetWithResult target =
                  new InjectTargetWithResult(
                      TargetType.ASSETS_GROUPS,
                      assetGroup.getAsset_group_id(),
                      assetGroup.getAsset_group_name(),
                      defaultExpectationResultsByTypes,
                      children,
                      null);

              targets.add(target);
            }
          });
    }

    // Calculate team results from expectations
    if (!teamExpectations.isEmpty()) {
      targets.addAll(
          teamExpectations.stream()
              .collect(
                  Collectors.groupingBy(
                      RawInjectExpectation::getTeam_id,
                      Collectors.collectingAndThen(
                          Collectors.toList(),
                          AtomicTestingUtils::getExpectationResultByTypesFromRaw)))
              .entrySet()
              .stream()
              .map(
                  entry ->
                      new InjectTargetWithResult(
                          TargetType.TEAMS,
                          entry.getKey(),
                          rawTeamMap
                              .get(teamExpectationMap.get(entry.getKey()).getTeam_id())
                              .getTeam_name(),
                          entry.getValue(),
                          playerExpectations.isEmpty()
                              ? List.of()
                              : calculateResultsForPlayersFromRaw(
                                  groupedByTeamAndUser.get(entry.getKey()), rawUserMap),
                          null))
              .toList());
    }

    // Calculate asset results from expectations
    if (!assetExpectations.isEmpty()) {
      // Assets are saves in assetsToRefine because we need check if the asset is linked to the
      // inject and, at the same time, also linked to the asset group
      assetsToRefine.addAll(
          assetExpectations.stream()
              .collect(
                  Collectors.groupingBy(
                      RawInjectExpectation::getAsset_id,
                      Collectors.collectingAndThen(
                          Collectors.toList(),
                          AtomicTestingUtils::getExpectationResultByTypesFromRaw)))
              .entrySet()
              .stream()
              .map(
                  entry ->
                      new InjectTargetWithResult(
                          TargetType.ASSETS,
                          entry.getKey(),
                          rawAssetMap
                              .get(assetExpectationMap.get(entry.getKey()).getAsset_id())
                              .getAsset_name(),
                          entry.getValue(),
                          Objects.equals(rawAssetMap.get(entry.getKey()).getAsset_type(), ENDPOINT)
                              ? Endpoint.PLATFORM_TYPE.valueOf(
                                  rawAssetMap.get(entry.getKey()).getEndpoint_platform())
                              : null))
              .toList());
    }

    // -- ASSETS GROUPS - CHILDREN --
    List<InjectTargetWithResult> assetsToRemove = new ArrayList<>();

    // Calculate asset groups results from expectations
    if (!assetGroupExpectations.isEmpty()) {
      targets.addAll(
          assetGroupExpectations.stream()
              .collect(
                  Collectors.groupingBy(
                      RawInjectExpectation::getAsset_group_id,
                      Collectors.collectingAndThen(
                          Collectors.toList(),
                          AtomicTestingUtils::getExpectationResultByTypesFromRaw)))
              .entrySet()
              .stream()
              .map(
                  entry -> {
                    List<InjectTargetWithResult> children = new ArrayList<>();

                    // Loop into assetsToRefine to keep just assets linked to asset group
                    for (InjectTargetWithResult asset : assetsToRefine) {
                      boolean foundExpectationForAsset =
                          rawAssetGroupMap
                              .get(assetGroupExpectationMap.get(entry.getKey()).getAsset_group_id())
                              .getAsset_ids()
                              .stream()
                              .anyMatch(assetChild -> assetChild.equals(asset.getId()));

                      // Verify if any expectation is related to a dynamic assets
                      boolean foundExpectationForDynamicAssets =
                          dynamicAssetGroupMap.get(entry.getKey()).stream()
                              .anyMatch(assetChild -> assetChild.getId().equals(asset.getId()));

                      if (foundExpectationForAsset || foundExpectationForDynamicAssets) {
                        children.add(asset);
                        // We add the assetId to the removal list for assets that are directly
                        // linked to the inject
                        assetsToRemove.add(asset);
                      }
                    }

                    // Other children without expectations are added with a default result
                    rawAssetGroupMap
                        .get(assetGroupExpectationMap.get(entry.getKey()).getAsset_group_id())
                        .getAsset_ids()
                        .forEach(
                            asset -> {
                              boolean foundAssetsWithoutResults =
                                  children.stream().noneMatch(child -> child.getId().equals(asset));
                              if (foundAssetsWithoutResults) {
                                children.add(
                                    new InjectTargetWithResult(
                                        TargetType.ASSETS,
                                        asset,
                                        rawAssetMap.get(asset).getAsset_name(),
                                        defaultExpectationResultsByTypes,
                                        Objects.equals(
                                                rawAssetMap.get(asset).getAsset_type(), ENDPOINT)
                                            ? Endpoint.PLATFORM_TYPE.valueOf(
                                                rawAssetMap.get(asset).getEndpoint_platform())
                                            : null));
                              }
                            });

                    // For dynamicAssets
                    if (dynamicAssetGroupMap.containsKey(entry.getKey())) {
                      dynamicAssetGroupMap
                          .get(entry.getKey())
                          .forEach(
                              dynamicAsset -> {
                                boolean foundDynamicAssetsWithoutResults =
                                    children.stream()
                                        .noneMatch(
                                            child -> child.getId().equals(dynamicAsset.getId()));
                                if (foundDynamicAssetsWithoutResults) {
                                  children.add(
                                      new InjectTargetWithResult(
                                          TargetType.ASSETS,
                                          dynamicAsset.getId(),
                                          dynamicAsset.getName(),
                                          defaultExpectationResultsByTypes,
                                          Objects.equals(dynamicAsset.getType(), ENDPOINT)
                                              ? Endpoint.PLATFORM_TYPE.valueOf(
                                                  String.valueOf(dynamicAsset.getPlatform()))
                                              : null));
                                }
                              });
                    }

                    return new InjectTargetWithResult(
                        TargetType.ASSETS_GROUPS,
                        entry.getKey(),
                        rawAssetGroupMap
                            .get(assetGroupExpectationMap.get(entry.getKey()).getAsset_group_id())
                            .getAsset_group_name(),
                        entry.getValue(),
                        sortResults(children),
                        null);
                  })
              .toList());
    }

    // Compare the assets directly linked to the inject {injectAssetIds} to retain only the results
    // from these assets
    assetsToRefine.removeAll(
        assetsToRemove.stream().filter(asset -> !injectAssetIds.contains(asset.getId())).toList());

    targets.addAll(assetsToRefine);
    return sortResults(targets);
  }

  // -- PRE CALCULATED RESULTS FOR PLAYERS --
  private static List<InjectTargetWithResult> calculateResultsForPlayersFromRaw(
      Map<String, List<RawInjectExpectation>> expectationsByUser, Map<String, RawUser> rawUserMap) {
    if (expectationsByUser == null) {
      return new ArrayList<>();
    }
    return expectationsByUser.entrySet().stream()
        .map(
            userEntry ->
                new InjectTargetWithResult(
                    TargetType.PLAYER,
                    userEntry.getKey(),
                    StringUtils.getName(
                        rawUserMap
                            .get(userEntry.getValue().get(0).getUser_id())
                            .getUser_firstname(),
                        rawUserMap
                            .get(userEntry.getValue().get(0).getUser_id())
                            .getUser_lastname()),
                    getExpectationResultByTypesFromRaw(userEntry.getValue()),
                    null))
        .toList();
  }

  // -- RESULTS BY EXPECTATION TYPE --
  @NotNull
  public static List<ExpectationResultsByType> getExpectationResultByTypesFromRaw(
      List<RawInjectExpectation> expectations) {
    List<Double> preventionScores =
        getScoresFromRaw(List.of(EXPECTATION_TYPE.PREVENTION), expectations);
    List<Double> detectionScores =
        getScoresFromRaw(List.of(EXPECTATION_TYPE.DETECTION), expectations);
    List<Double> humanScores =
        getScoresFromRaw(
            List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL),
            expectations);

    List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

    getExpectationByType(ExpectationType.PREVENTION, preventionScores)
        .ifPresent(resultAvgOfExpectations::add);
    getExpectationByType(ExpectationType.DETECTION, detectionScores)
        .ifPresent(resultAvgOfExpectations::add);
    getExpectationByType(ExpectationType.HUMAN_RESPONSE, humanScores)
        .ifPresent(resultAvgOfExpectations::add);

    return resultAvgOfExpectations;
  }

  @NotNull
  public static List<ExpectationResultsByType> getExpectationResultByTypes(
      final List<InjectExpectation> expectations) {
    List<Double> preventionScores = getScores(List.of(EXPECTATION_TYPE.PREVENTION), expectations);
    List<Double> detectionScores = getScores(List.of(EXPECTATION_TYPE.DETECTION), expectations);
    List<Double> humanScores =
        getScores(
            List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL),
            expectations);

    List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

    getExpectationByType(ExpectationType.PREVENTION, preventionScores)
        .map(resultAvgOfExpectations::add);
    getExpectationByType(ExpectationType.DETECTION, detectionScores)
        .map(resultAvgOfExpectations::add);
    getExpectationByType(ExpectationType.HUMAN_RESPONSE, humanScores)
        .map(resultAvgOfExpectations::add);

    return resultAvgOfExpectations;
  }

  // -- NORMALIZED SCORES --
  public static List<Double> getScoresFromRaw(
      List<EXPECTATION_TYPE> types, List<RawInjectExpectation> expectations) {
    return expectations.stream()
        .filter(e -> types.contains(EXPECTATION_TYPE.valueOf(e.getInject_expectation_type())))
        .map(
            rawInjectExpectation -> {
              if (rawInjectExpectation.getInject_expectation_score() == null) {
                return null;
              }
              if (rawInjectExpectation.getTeam_id() != null) {
                if (rawInjectExpectation.getInject_expectation_score()
                    >= rawInjectExpectation.getInject_expectation_expected_score()) {
                  return 1.0;
                } else {
                  return 0.0;
                }
              } else {
                if (rawInjectExpectation.getInject_expectation_score()
                    >= rawInjectExpectation.getInject_expectation_expected_score()) {
                  return 1.0;
                }
                if (rawInjectExpectation.getInject_expectation_score() == 0) {
                  return 0.0;
                }
                return 0.5;
              }
            })
        .toList();
  }

  public static List<Double> getScores(
      final List<EXPECTATION_TYPE> types, final List<InjectExpectation> expectations) {
    return expectations.stream()
        .filter(e -> types.contains(e.getType()))
        .map(
            injectExpectation -> {
              if (injectExpectation.getScore() == null) {
                return null;
              }
              if (injectExpectation.getTeam() != null) {
                if (injectExpectation.getScore() >= injectExpectation.getExpectedScore()) {
                  return 1.0;
                } else {
                  return 0.0;
                }
              } else {
                if (injectExpectation.getScore() >= injectExpectation.getExpectedScore()) {
                  return 1.0;
                }
                if (injectExpectation.getScore() == 0) {
                  return 0.0;
                }
                return 0.5;
              }
            })
        .toList();
  }

  // -- UTILS --
  @NotNull
  private static List<ExpectationResultsByType> getDefaultExpectationResultsByTypes() {
    List<ExpectationType> types =
        List.of(
            ExpectationType.PREVENTION, ExpectationType.DETECTION, ExpectationType.HUMAN_RESPONSE);
    return types.stream()
        .map(type -> getExpectationByType(type, Collections.emptyList()))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .toList();
  }

  public static Optional<ExpectationResultsByType> getExpectationByType(
      final ExpectationType type, final List<Double> scores) {
    if (scores.isEmpty()) {
      return Optional.of(
          new ExpectationResultsByType(
              type, InjectExpectation.EXPECTATION_STATUS.UNKNOWN, Collections.emptyList()));
    }
    OptionalDouble avgResponse = calculateAverageFromExpectations(scores);
    if (avgResponse.isPresent()) {
      return Optional.of(
          new ExpectationResultsByType(
              type, getResult(avgResponse), getResultDetail(type, scores)));
    }
    return Optional.of(
        new ExpectationResultsByType(
            type, InjectExpectation.EXPECTATION_STATUS.PENDING, getResultDetail(type, scores)));
  }

  public static InjectExpectation.EXPECTATION_STATUS getResult(final OptionalDouble avg) {
    Double avgAsDouble = avg.getAsDouble();
    return avgAsDouble == 0.0
        ? InjectExpectation.EXPECTATION_STATUS.FAILED
        : (avgAsDouble == 1.0
            ? InjectExpectation.EXPECTATION_STATUS.SUCCESS
            : InjectExpectation.EXPECTATION_STATUS.PARTIAL);
  }

  public static OptionalDouble calculateAverageFromExpectations(final List<Double> scores) {
    return scores.stream()
        .filter(Objects::nonNull)
        .mapToDouble(Double::doubleValue)
        .average(); // Null values are expectations for injects in Pending
  }

  public static List<ResultDistribution> getResultDetail(
      final ExpectationType type, final List<Double> normalizedScores) {
    long successCount = normalizedScores.stream().filter(s -> s != null && s.equals(1.0)).count();
    long partialCount = normalizedScores.stream().filter(s -> s != null && s.equals(0.5)).count();
    long pendingCount = normalizedScores.stream().filter(Objects::isNull).count();
    long failureCount = normalizedScores.stream().filter(s -> s != null && s.equals(0.0)).count();

    return List.of(
        new ResultDistribution(ExpectationType.SUCCESS_ID, type.successLabel, (int) successCount),
        new ResultDistribution(ExpectationType.PENDING_ID, type.pendingLabel, (int) pendingCount),
        new ResultDistribution(ExpectationType.PARTIAL_ID, type.partialLabel, (int) partialCount),
        new ResultDistribution(ExpectationType.FAILED_ID, type.failureLabel, (int) failureCount));
  }

  private static List<InjectTargetWithResult> sortResults(List<InjectTargetWithResult> targets) {
    return targets.stream().sorted(Comparator.comparing(InjectTargetWithResult::getName)).toList();
  }

  // -- RECORDS --
  public record ExpectationResultsByType(
      @NotNull ExpectationType type,
      @NotNull InjectExpectation.EXPECTATION_STATUS avgResult,
      @NotNull List<ResultDistribution> distribution) {}

  public record ResultDistribution(
      @NotNull String id, @NotNull String label, @NotNull Integer value) {}
}
