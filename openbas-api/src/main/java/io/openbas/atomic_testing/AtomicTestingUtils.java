package io.openbas.atomic_testing;

import io.openbas.atomic_testing.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.atomic_testing.AtomicTestingMapper.ResultDistribution;
import io.openbas.atomic_testing.form.InjectTargetWithResult;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.OptionalDouble;
import jakarta.validation.constraints.NotNull;
import java.util.stream.Collectors;

public class AtomicTestingUtils {

  public static List<InjectTargetWithResult> getTargets(final Inject inject) {
    List<InjectTargetWithResult> targets = new ArrayList<>();
    targets.addAll(inject.getTeams()
        .stream()
        .map(t -> new InjectTargetWithResult(TargetType.TEAMS, t.getId(), t.getName(), List.of()))
        .toList());
    targets.addAll(inject.getAssets()
        .stream()
        .map(t -> new InjectTargetWithResult(TargetType.ASSETS, t.getId(), t.getName(), List.of()))
        .toList());
    targets.addAll(inject.getAssetGroups()
        .stream()
        .map(t -> new InjectTargetWithResult(TargetType.ASSETS_GROUPS, t.getId(), t.getName(), List.of()))
        .toList());

    return targets;
  }

  public static List<InjectTargetWithResult> getTargetsWithResults(final Inject inject) {
    List<ExpectationResultsByType> resultsByTypes = getDefaultExpectationResultsByTypes();
    List<InjectExpectation> expectations = inject.getExpectations();

    List<InjectExpectation> teamExpectations = new ArrayList<>();
    List<InjectExpectation> assetExpectations = new ArrayList<>();
    List<InjectExpectation> assetGroupExpectations = new ArrayList<>();

    expectations.forEach(expectation -> {
      if (expectation.getTeam() != null) {
        teamExpectations.add(expectation);
      }
      if (expectation.getAsset() != null) {
        assetExpectations.add(expectation);
      }
      if (expectation.getAssetGroup() != null) {
        assetGroupExpectations.add(expectation);
      }
    });

    List<InjectTargetWithResult> targets = new ArrayList<>();
    List<InjectTargetWithResult> assetsToRefine = new ArrayList<>();
    List<InjectTargetWithResult> assetsWithoutParent = new ArrayList<>();

    /* Match Target with expectations
     * */
    inject.getTeams().forEach(team -> {
      // Check if there are no expectations matching the current team (t)
      boolean noMatchingExpectations = teamExpectations.stream()
          .noneMatch(exp -> exp.getTeam().getId().equals(team.getId()));
      if (noMatchingExpectations) {
        InjectTargetWithResult target = new InjectTargetWithResult(
            TargetType.TEAMS,
            team.getId(),
            team.getName(),
            resultsByTypes
        );
        targets.add(target);
      }
    });
    inject.getAssets().forEach(asset -> {
      // Check if there are no expectations matching the current asset (t)
      boolean noMatchingExpectations = assetExpectations.stream()
          .noneMatch(exp -> exp.getAsset().getId().equals(asset.getId()));

      if (noMatchingExpectations) {
        InjectTargetWithResult target = new InjectTargetWithResult(
            TargetType.ASSETS,
            asset.getId(),
            asset.getName(),
            resultsByTypes
        );

        targets.add(target);
      }
    });
    inject.getAssetGroups().forEach(assetGroup -> {
      // Check if there are no expectations matching the current assetgroup (t)
      boolean noMatchingExpectations = assetGroupExpectations.stream()
          .noneMatch(exp -> exp.getAssetGroup().getId().equals(assetGroup.getId()));

      if (noMatchingExpectations) {
        InjectTargetWithResult target = new InjectTargetWithResult(
            TargetType.ASSETS_GROUPS,
            assetGroup.getId(),
            assetGroup.getName(),
            resultsByTypes
        );

        targets.add(target);
      }
    });

    /* Build results for expectations with scores
     */
    if (!teamExpectations.isEmpty()) {
      targets.addAll(
          teamExpectations
              .stream()
              .collect(
                  Collectors.groupingBy(InjectExpectation::getTeam,
                      Collectors.collectingAndThen(
                          Collectors.toList(), AtomicTestingUtils::getExpectations)
                  )
              )
              .entrySet().stream()
              .map(entry -> new InjectTargetWithResult(TargetType.TEAMS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue()))
              .toList()
      );
    }
    if (!assetExpectations.isEmpty()) {
      assetsToRefine.addAll(
          assetExpectations
              .stream()
              .collect(
                  Collectors.groupingBy(InjectExpectation::getAsset,
                      Collectors.collectingAndThen(
                          Collectors.toList(), AtomicTestingUtils::getExpectations)
                  )
              )
              .entrySet().stream()
              .map(entry -> new InjectTargetWithResult(TargetType.ASSETS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue()))
              .toList()
      );
    }
    if (!assetGroupExpectations.isEmpty()) {
      targets.addAll(assetGroupExpectations
          .stream()
          .collect(
              Collectors.groupingBy(InjectExpectation::getAssetGroup,
                  Collectors.collectingAndThen(
                      Collectors.toList(), AtomicTestingUtils::getExpectations)
              )
          )
          .entrySet().stream()
          .map(entry -> {
            List<InjectTargetWithResult> children = new ArrayList<>();

            assetsToRefine.forEach(asset -> {
              boolean found = entry.getKey().getAssets().stream()
                  .anyMatch(parentAsset -> parentAsset.getId().equals(asset.getId()));
              if (found) {
                children.add(asset);
              } else {
                assetsWithoutParent.add(asset);
              }
            });

            return new InjectTargetWithResult(TargetType.ASSETS_GROUPS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue(), children);
          })
          .toList());
    }

    targets.addAll(assetsWithoutParent);

    return targets.stream().sorted(Comparator.comparing(InjectTargetWithResult::getName)).toList();
  }

  @NotNull
  private static List<ExpectationResultsByType> getDefaultExpectationResultsByTypes() {
    List<ExpectationType> types = List.of(ExpectationType.DETECTION, ExpectationType.PREVENTION, ExpectationType.HUMAN_RESPONSE);
    return types.stream()
        .map(type -> getExpectationByType(type, Collections.singletonList(null)))
        .filter(Optional::isPresent)
        .map(Optional::get)
        .toList();
  }

  @NotNull
  public static List<ExpectationResultsByType> getExpectations(final List<InjectExpectation> expectations) {
    List<Integer> preventionScores = getScores(List.of(EXPECTATION_TYPE.PREVENTION), expectations);
    List<Integer> detectionScores = getScores(List.of(EXPECTATION_TYPE.DETECTION), expectations);
    List<Integer> humanScores = getScores(List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL), expectations);

    List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

    getExpectationByType(ExpectationType.PREVENTION, preventionScores).map(resultAvgOfExpectations::add);
    getExpectationByType(ExpectationType.DETECTION, detectionScores).map(resultAvgOfExpectations::add);
    getExpectationByType(ExpectationType.HUMAN_RESPONSE, humanScores).map(resultAvgOfExpectations::add);

    return resultAvgOfExpectations;
  }

  public static Optional<ExpectationResultsByType> getExpectationByType(final ExpectationType type, final List<Integer> scores) {
    if (scores.isEmpty()) {
      return Optional.of(new ExpectationResultsByType(type, ExpectationStatus.UNKNOWN, Collections.emptyList()));
    }
    OptionalDouble avgResponse = calculateAverageFromExpectations(scores);
    if (avgResponse.isPresent()) {
      return Optional.of(new ExpectationResultsByType(type, getResult(avgResponse), getResultDetail(type, scores)));
    }
    return Optional.of(new ExpectationResultsByType(type, ExpectationStatus.PENDING, getResultDetail(type, scores)));
  }

  public static List<ResultDistribution> getResultDetail(final ExpectationType type, final List<Integer> normalizedScores) {
    long successCount = normalizedScores.stream().filter(s -> s != null && s.equals(1)).count();
    long pendingCount = normalizedScores.stream().filter(Objects::isNull).count();
    long failureCount = normalizedScores.stream().filter(s -> s != null && s.equals(0)).count();

    return List.of(
        new ResultDistribution(type.successLabel, (int) successCount),
        new ResultDistribution(type.pendingLabel, (int) pendingCount),
        new ResultDistribution(type.failureLabel, (int) failureCount)
    );
  }

  public static List<Integer> getScores(final List<EXPECTATION_TYPE> types, final List<InjectExpectation> expectations) {
    return expectations
        .stream()
        .filter(e -> types.contains(e.getType()))
        .map(InjectExpectation::getScore)
        .map(score -> score == null ? null : (score == 0 ? 0 : 1))
        .toList();
  }

  public static ExpectationStatus getResult(final OptionalDouble avg) {
    Double avgAsDouble = avg.getAsDouble();
    return avgAsDouble == 0.0 ? ExpectationStatus.FAILED :
        (avgAsDouble == 1.0 ? ExpectationStatus.VALIDATED :
            ExpectationStatus.PARTIAL);
  }

  public static OptionalDouble calculateAverageFromExpectations(final List<Integer> scores) {
    return scores.stream()
        .filter(Objects::nonNull)
        .mapToInt(Integer::intValue)
        .average();
  }

}
