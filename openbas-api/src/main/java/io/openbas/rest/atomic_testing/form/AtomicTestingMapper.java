package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.model.InjectStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.stream.Collectors;
import org.jetbrains.annotations.NotNull;

public class AtomicTestingMapper {

  public static AtomicTestingOutput toDto(Inject inject) {
    return AtomicTestingOutput
        .builder()
        .id(inject.getId())
        .title(inject.getTitle())
        .type(inject.getType())
        .contract(inject.getContract())
        .lastExecutionDate(getLastExecutionDate(inject))
        .targets(getTargets(inject.getExpectations()))
        .status(inject.getStatus().map(InjectStatus::getName).orElse(ExecutionStatus.DRAFT))
        .expectationResultByTypes(getExpectations(inject.getExpectations()))
        .build();
  }

  public static List<AtomicTestingOutput> toDto(List<Inject> injects) {
    return injects.stream().map(AtomicTestingMapper::toDto).toList();
  }

  public static SimpleExpectationResultOutput toTargetResultDto(InjectExpectation injectExpectation) {
    return SimpleExpectationResultOutput
        .builder()
        .id(injectExpectation.getId())
        .injectId(injectExpectation.getInject().getId())
        .type(ExpectationType.of(injectExpectation.getType().name()))
        .subtype(injectExpectation.getType().name())
        .startedAt(injectExpectation.getCreatedAt())
        .endedAt(injectExpectation.getUpdatedAt())
        .logs(Optional.ofNullable(
                injectExpectation.getResults())
            .map(results -> results.stream().map(InjectExpectationResult::getResult)
                .collect(Collectors.joining(", ")))
            .orElse(null))
        .response(injectExpectation.getScore() == null ? ExpectationStatus.UNKNOWN : (injectExpectation.getScore() == 0 ? ExpectationStatus.FAILED : ExpectationStatus.VALIDATED))
        .build();
  }

  public static List<SimpleExpectationResultOutput> toTargetResultDto(List<InjectExpectation> injectExpectations, String targetId) {
    return injectExpectations
        .stream()
        .map(AtomicTestingMapper::toTargetResultDto)
        .peek(dto -> dto.setTargetId(targetId))
        .toList();
  }

  private static Instant getLastExecutionDate(final Inject inject) {
    return inject.getStatus().map(InjectStatus::getTrackingEndDate).orElseGet(inject::getUpdatedAt);
  }

  private static List<InjectTargetWithResult> getTargets(final List<InjectExpectation> expectations) {
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

    if (!teamExpectations.isEmpty()) {
      targets.addAll(
          teamExpectations
              .stream()
              .collect(
                  Collectors.groupingBy(InjectExpectation::getTeam,
                      Collectors.collectingAndThen(
                          Collectors.toList(), AtomicTestingMapper::getExpectations)
                  )
              )
              .entrySet().stream()
              .map(entry -> new InjectTargetWithResult(TargetType.TEAMS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue()))
              .toList()
      );
    }

    if (!assetExpectations.isEmpty()) {
      targets.addAll(
          assetExpectations
              .stream()
              .collect(
                  Collectors.groupingBy(InjectExpectation::getAsset,
                      Collectors.collectingAndThen(
                          Collectors.toList(), AtomicTestingMapper::getExpectations)
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
                      Collectors.toList(), AtomicTestingMapper::getExpectations)
              )
          )
          .entrySet().stream()
          .map(entry -> new InjectTargetWithResult(TargetType.ASSETS_GROUPS, entry.getKey().getId(), entry.getKey().getName(), entry.getValue()))
          .toList());
    }

    return targets.stream().sorted(Comparator.comparing(InjectTargetWithResult::name)).toList();
  }

  @NotNull
  private static List<ExpectationResultsByType> getExpectations(List<InjectExpectation> expectations) {
    List<Integer> preventionScores = getScores(List.of(EXPECTATION_TYPE.PREVENTION), expectations);
    List<Integer> detectionScores = getScores(List.of(EXPECTATION_TYPE.DETECTION), expectations);
    List<Integer> humanScores = getScores(List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL), expectations);

    List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

    if (preventionScores.stream().anyMatch(Objects::isNull)) {
      resultAvgOfExpectations.add(new ExpectationResultsByType(ExpectationType.PREVENTION, ExpectationStatus.UNKNOWN, Collections.emptyList()));
    } else {
      OptionalDouble avgPrevention = calculateAverageFromExpectations(preventionScores);
      if (avgPrevention.isPresent()) {
        resultAvgOfExpectations.add(new ExpectationResultsByType(ExpectationType.PREVENTION, getResult(avgPrevention), getResultDetail(ExpectationType.PREVENTION, preventionScores)));
      }
    }

    if (detectionScores.stream().anyMatch(Objects::isNull)) {
      resultAvgOfExpectations.add(new ExpectationResultsByType(ExpectationType.DETECTION, ExpectationStatus.UNKNOWN, Collections.emptyList()));
    } else {
      OptionalDouble avgDetection = calculateAverageFromExpectations(detectionScores);
      if (avgDetection.isPresent()) {
        resultAvgOfExpectations.add(new ExpectationResultsByType(ExpectationType.DETECTION, getResult(avgDetection), getResultDetail(ExpectationType.DETECTION, detectionScores)));
      }
    }

    if (humanScores.stream().anyMatch(Objects::isNull)) {
      resultAvgOfExpectations.add(new ExpectationResultsByType(ExpectationType.HUMAN_RESPONSE, ExpectationStatus.UNKNOWN, Collections.emptyList()));
    } else {
      OptionalDouble avgHumanResponse = calculateAverageFromExpectations(humanScores);
      if (avgHumanResponse.isPresent()) {
        resultAvgOfExpectations.add(new ExpectationResultsByType(ExpectationType.HUMAN_RESPONSE, getResult(avgHumanResponse), getResultDetail(ExpectationType.HUMAN_RESPONSE, humanScores)));
      }
    }
    return resultAvgOfExpectations;
  }

  private static List<ResultDistribution> getResultDetail(ExpectationType type, List<Integer> normalizedScores) {
    long successCount = normalizedScores.stream().filter(score -> score.equals(1)).count();
    long failureCount = normalizedScores.size() - successCount;

    return List.of(
        new ResultDistribution(type.successLabel, (int) successCount),
        new ResultDistribution(type.failureLabel, (int) failureCount)
    );
  }

  private static List<Integer> getScores(List<EXPECTATION_TYPE> types, List<InjectExpectation> expectations) {
    return expectations
        .stream()
        .filter(e -> types.contains(e.getType()))
        .map(InjectExpectation::getScore)
        .map(score -> score == null ? null : (score == 0 ? 0 : 1))
        .toList();
  }

  private static ExpectationStatus getResult(OptionalDouble avg) {
    Double avgAsDouble = avg.getAsDouble();
    return avgAsDouble == 0.0 ? ExpectationStatus.FAILED :
        (avgAsDouble == 1.0 ? ExpectationStatus.VALIDATED :
            ExpectationStatus.PARTIAL);
  }

  private static OptionalDouble calculateAverageFromExpectations(List<Integer> scores) {
    return scores.stream()
        .filter(Objects::nonNull)
        .mapToInt(Integer::intValue)
        .average();
  }

  public record ExpectationResultsByType(@NotNull ExpectationType type, @NotNull ExpectationStatus avgResult, @NotNull List<ResultDistribution> distribution) {

  }

  public record ResultDistribution(@NotNull String label, @NotNull Integer value) {

  }

  public record InjectTargetWithResult(@NotNull TargetType targetType, @NotNull String id, @NotNull String name, @NotNull List<ExpectationResultsByType> expectationResultsByTypes) {

  }

}
