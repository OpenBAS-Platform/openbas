package io.openbas.utils;

import io.openbas.database.model.*;
import io.openbas.database.model.InjectExpectation.EXPECTATION_TYPE;
import io.openbas.database.raw.*;
import io.openbas.expectation.ExpectationType;
import jakarta.validation.constraints.NotNull;
import java.util.*;

public class AtomicTestingUtils {

  @NotNull
  public static List<ExpectationResultsByType> getExpectationResultByTypesFromRaw(
      List<RawInjectExpectation> expectations) {

    List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

    addIfRawScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.PREVENTION),
        ExpectationType.PREVENTION,
        expectations);

    addIfRawScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.DETECTION),
        ExpectationType.DETECTION,
        expectations);

    addIfRawScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.VULNERABILITY),
        ExpectationType.VULNERABILITY,
        expectations);

    addIfRawScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL),
        ExpectationType.HUMAN_RESPONSE,
        expectations);

    return resultAvgOfExpectations;
  }

  @NotNull
  public static List<ExpectationResultsByType> getExpectationResultByTypes(
      final List<InjectExpectation> expectations) {

    List<ExpectationResultsByType> resultAvgOfExpectations = new ArrayList<>();

    addIfScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.PREVENTION),
        ExpectationType.PREVENTION,
        expectations);

    addIfScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.DETECTION),
        ExpectationType.DETECTION,
        expectations);

    addIfScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.VULNERABILITY),
        ExpectationType.VULNERABILITY,
        expectations);

    addIfScoresPresent(
        resultAvgOfExpectations,
        List.of(EXPECTATION_TYPE.ARTICLE, EXPECTATION_TYPE.CHALLENGE, EXPECTATION_TYPE.MANUAL),
        ExpectationType.HUMAN_RESPONSE,
        expectations);

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

  private static void addIfScoresPresent(
      List<ExpectationResultsByType> resultList,
      List<EXPECTATION_TYPE> types,
      ExpectationType resultType,
      List<InjectExpectation> expectations) {
    List<Double> scores = getScores(types, expectations);
    if (!scores.isEmpty()) {
      getExpectationByType(resultType, scores).ifPresent(resultList::add);
    }
  }

  private static void addIfRawScoresPresent(
      List<ExpectationResultsByType> resultList,
      List<EXPECTATION_TYPE> types,
      ExpectationType resultType,
      List<RawInjectExpectation> expectations) {
    List<Double> scores = getScoresFromRaw(types, expectations);
    if (!scores.isEmpty()) {
      getExpectationByType(resultType, scores).ifPresent(resultList::add);
    }
  }

  // -- RECORDS --
  public record ExpectationResultsByType(
      @NotNull ExpectationType type,
      @NotNull InjectExpectation.EXPECTATION_STATUS avgResult,
      @NotNull List<ResultDistribution> distribution) {}

  public record ResultDistribution(
      @NotNull String id, @NotNull String label, @NotNull Integer value) {}
}
