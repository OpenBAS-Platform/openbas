package io.openbas.utils.inject_expectation_result;

import static io.openbas.service.InjectExpectationService.COLLECTOR;
import static java.time.Instant.now;
import static org.springframework.util.StringUtils.hasText;

import io.openbas.database.model.Collector;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public class InjectExpectationResultUtils {

  public static final String EXPIRED = "Expired";
  public static final double FAILED_SCORE_VALUE = 0.0;

  private InjectExpectationResultUtils() {}

  // -- SETUP --

  private static InjectExpectationResult setUp(
      @NotNull final String sourceId, @NotNull final String sourceName) {
    return InjectExpectationResult.builder()
        .sourceId(sourceId)
        .sourceType(COLLECTOR)
        .date(String.valueOf(Instant.now()))
        .sourceName(sourceName)
        .build();
  }

  public static List<InjectExpectationResult> setUpFromCollectors(
      @NotNull final List<Collector> collectors) {
    return collectors.stream().map(c -> setUp(c.getId(), c.getName())).toList();
  }

  // -- BUILD --

  public static InjectExpectationResult build(
      @NotNull final ExpectationUpdateInput input, @NotNull final String result) {
    return InjectExpectationResult.builder()
        .sourceId(input.getSourceId())
        .sourceType(input.getSourceType())
        .sourceName(input.getSourceName())
        .result(result)
        .date(now().toString())
        .score(input.getScore())
        .build();
  }

  public static void build(
      @NotNull final InjectExpectation expectation,
      @NotNull final Collector collector,
      @NotBlank final String result,
      final boolean success,
      final Map<String, String> metadata) {
    final double score = computeScore(expectation, success);

    InjectExpectationResult existing =
        findResultBySourceId(expectation.getResults(), collector.getId());

    if (existing != null) {
      existing.setResult(result);
      existing.setScore(score);
      existing.setMetadata(metadata);
    } else {
      InjectExpectationResult expectationResult =
          InjectExpectationResult.builder()
              .sourceId(collector.getId())
              .sourceType(COLLECTOR)
              .sourceName(collector.getName())
              .result(result)
              .date(Instant.now().toString())
              .score(score)
              .metadata(metadata)
              .build();
      expectation.getResults().add(expectationResult);
    }
  }

  public static InjectExpectationResult buildForMediaPressure(
      @NotNull final InjectExpectation injectExpectation) {
    return InjectExpectationResult.builder()
        .sourceId("media-pressure")
        .sourceType("media-pressure")
        .sourceName("Media pressure read")
        .result(Instant.now().toString())
        .date(Instant.now().toString())
        .score(injectExpectation.getExpectedScore())
        .build();
  }

  public static InjectExpectationResult buildForVulnerabilityManager() {
    return InjectExpectationResult.builder()
        .sourceId("acab8214-0379-448a-a575-05e9d934eadd")
        .sourceType("openbas_expectations_vulnerability_manager")
        .sourceName("Expectations Vulnerability Manager")
        .result("Vulnerable")
        .date(String.valueOf(Instant.now()))
        .build();
  }

  public static InjectExpectationResult buildForPlayerManualValidation(
      @NotNull final String result, @NotNull final Double score) {
    return InjectExpectationResult.builder()
        .sourceId("player-manual-validation")
        .sourceType("player-manual-validation")
        .sourceName("Player Manual Validation")
        .result(result)
        .score(score)
        .date(String.valueOf(Instant.now()))
        .build();
  }

  public static InjectExpectationResult buildForTeamManualValidation(
      @NotNull final String result, @NotNull final Double score) {
    return InjectExpectationResult.builder()
        .sourceId("team-manual-validation")
        .sourceType("team-manual-validation")
        .sourceName("Team Manual Validation")
        .result(result)
        .score(score)
        .date(String.valueOf(Instant.now()))
        .build();
  }

  // -- CLOSE --

  public static void expireEmptyResults(@NotNull final List<InjectExpectationResult> results) {
    results.stream()
        .filter(r -> !hasText(r.getResult()))
        .forEach(
            r -> {
              r.setScore(FAILED_SCORE_VALUE);
              r.setResult(EXPIRED);
            });
  }

  // -- SCORE --

  public static double computeScore(
      @NotNull final InjectExpectation expectation, final boolean success) {
    return success ? expectation.getExpectedScore() : FAILED_SCORE_VALUE;
  }

  // -- GETTER --

  public static InjectExpectationResult findResultBySourceId(
      @NotNull final List<InjectExpectationResult> results, @NotBlank final String sourceId) {
    return results.stream().filter(r -> sourceId.equals(r.getSourceId())).findFirst().orElse(null);
  }

  // -- RESULT --

  public static boolean hasNoResult(
      @NotNull final List<InjectExpectationResult> results, @NotBlank final String sourceId) {
    return results.stream()
        .noneMatch(
            r -> {
              if (sourceId.equals(r.getSourceId())) {
                return hasText(r.getResult());
              }
              return false;
            });
  }

  public static boolean hasNoResultForSource(
      List<InjectExpectationResult> results, String sourceId) {
    return results.stream().noneMatch(r -> sourceId.equals(r.getSourceId()));
  }

  public static boolean hasNoResults(@NotNull final List<InjectExpectationResult> results) {
    return results.isEmpty() || results.stream().noneMatch(r -> hasText(r.getResult()));
  }

  public static boolean hasAnyEmptyResult(@NotNull List<InjectExpectationResult> results) {
    return results.isEmpty() || results.stream().anyMatch(r -> !hasText(r.getResult()));
  }

  public static boolean hasValidResults(@NotNull final List<InjectExpectationResult> results) {
    return !results.isEmpty() && results.stream().allMatch(r -> hasText(r.getResult()));
  }

  public static boolean hasValidResultFromSource(
      @NotNull final List<InjectExpectationResult> results, @NotBlank final String sourceId) {
    return results.stream()
        .anyMatch(r -> sourceId.equals(r.getSourceId()) && hasText(r.getResult()));
  }
}
