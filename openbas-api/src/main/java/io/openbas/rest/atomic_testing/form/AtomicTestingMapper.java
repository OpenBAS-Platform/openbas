package io.openbas.rest.atomic_testing.form;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.model.InjectStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
        .expectationResults(getExpectations(inject.getExpectations()))
        .build();
  }

  public static List<AtomicTestingOutput> toDto(List<Inject> injects) {
    return injects.stream().map(AtomicTestingMapper::toDto).toList();
  }

  private static Instant getLastExecutionDate(final Inject inject) {
    return inject.getStatus().map(InjectStatus::getTrackingEndDate).orElseGet(inject::getUpdatedAt);
  }

  private static List<BasicTarget> getTargets(final List<InjectExpectation> expectations) {
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

    List<BasicTarget> targets = new ArrayList<>();

    if (!teamExpectations.isEmpty()) {
      targets.add(new BasicTarget(TargetType.TEAMS, teamExpectations
          .stream()
          .collect(
              Collectors.groupingBy(InjectExpectation::getTeam,
                  Collectors.collectingAndThen(
                      Collectors.toList(), AtomicTestingMapper::getExpectations)
              )
          )
          .entrySet().stream()
          .map(entry -> new TargetResult(entry.getKey().getId(), entry.getKey().getName(), entry.getValue()))
          .toList()));
    }

    if (!assetExpectations.isEmpty()) {
      targets.add(new BasicTarget(TargetType.ASSETS, assetExpectations
          .stream()
          .collect(
              Collectors.groupingBy(InjectExpectation::getTeam,
                  Collectors.collectingAndThen(
                      Collectors.toList(), AtomicTestingMapper::getExpectations)
              )
          )
          .entrySet().stream()
          .map(entry -> new TargetResult(entry.getKey().getId(), entry.getKey().getName(), entry.getValue()))
          .toList()));

    }

    if (!assetGroupExpectations.isEmpty()) {
      targets.add(new BasicTarget(TargetType.ASSETS_GROUPS, assetGroupExpectations
          .stream()
          .collect(
              Collectors.groupingBy(InjectExpectation::getTeam,
                  Collectors.collectingAndThen(
                      Collectors.toList(), AtomicTestingMapper::getExpectations)
              )
          )
          .entrySet().stream()
          .map(entry -> new TargetResult(entry.getKey().getId(), entry.getKey().getName(), entry.getValue()))
          .toList()));
    }

    return targets;
  }

  @NotNull
  private static List<BasicExpectationResult> getExpectations(List<InjectExpectation> expectations) {
    List<Integer> preventionScores = getScores(List.of(EXPECTATION_TYPE.PREVENTION), expectations);
    List<Integer> detectionScores = getScores(List.of(EXPECTATION_TYPE.DETECTION), expectations);
    List<Integer> humanScores = getScores(List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL), expectations);

    List<BasicExpectationResult> resultAvgOfExpectations = new ArrayList<>();

    OptionalDouble avgPrevention = calculateAverageFromExpectations(preventionScores);
    if (avgPrevention.isPresent()) {
      resultAvgOfExpectations.add(new BasicExpectationResult(ExpectationType.PREVENTION, getResult(avgPrevention), getResultDetail(ExpectationType.PREVENTION, preventionScores)));
    }

    OptionalDouble avgDetection = calculateAverageFromExpectations(detectionScores);
    if (avgDetection.isPresent()) {
      resultAvgOfExpectations.add(new BasicExpectationResult(ExpectationType.DETECTION, getResult(avgDetection), getResultDetail(ExpectationType.DETECTION, detectionScores)));
    }

    OptionalDouble avgHumanResponse = calculateAverageFromExpectations(humanScores);
    if (avgHumanResponse.isPresent()) {
      resultAvgOfExpectations.add(new BasicExpectationResult(ExpectationType.HUMAN_RESPONSE, getResult(avgHumanResponse), getResultDetail(ExpectationType.HUMAN_RESPONSE, humanScores)));
    }
    return resultAvgOfExpectations;
  }

  private static List<ResultDetail> getResultDetail(ExpectationType type, List<Integer> normalizedScores) {
    long successCount = normalizedScores.stream().filter(score -> score.equals(1)).count();
    long failureCount = normalizedScores.size() - successCount;

    return List.of(
        new ResultDetail(type.successLabel, (int) successCount),
        new ResultDetail(type.failureLabel, (int) failureCount)
    );
  }

  private static List<Integer> getScores(List<EXPECTATION_TYPE> types, List<InjectExpectation> expectations) {
    return expectations
        .stream()
        .filter(e -> types.contains(e.getType()))
        .map(InjectExpectation::getScore)
        .map(score -> score == 0 ? 0 : 1)
        .toList();
  }

  private static ExecutionStatus getResult(OptionalDouble avg) {
    Double avgAsDouble = avg.getAsDouble();
    return avgAsDouble == 0.0 ? ExecutionStatus.ERROR :
        (avgAsDouble == 1.0 ? ExecutionStatus.SUCCESS :
            ExecutionStatus.PARTIAL);
  }

  private static OptionalDouble calculateAverageFromExpectations(List<Integer> scores) {
    return scores.stream()
        .mapToInt(Integer::intValue)
        .average();
  }

  enum TargetType {
    ASSETS,
    ASSETS_GROUPS,
    TEAMS
  }

  enum ExpectationType {
    PREVENTION("Blocked", "Unblocked"),
    DETECTION("Detected", "Undetected"),
    HUMAN_RESPONSE("Successful", "Failed");

    public final String successLabel;
    public final String failureLabel;

    ExpectationType(String successLabel, String failureLabel) {
      this.successLabel = successLabel;
      this.failureLabel = failureLabel;
    }
  }

  record BasicExpectationResult(@NotNull ExpectationType type, @NotNull ExecutionStatus result, @NotNull List<ResultDetail> distribution) {

  }

  record ResultDetail(@NotNull String label, @NotNull Integer value) {

  }

  record BasicTarget(@NotNull TargetType type, @NotNull List<TargetResult> targets) {

  }

  record TargetResult(@NotNull String id, @NotNull String name, @NotNull List<BasicExpectationResult> expectationResults) {

  }

}
