package io.openbas.rest.scenario.service;

import io.openbas.database.raw.RawFinishedExerciseWithInjects;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.expectation.ExpectationType;
import io.openbas.rest.scenario.response.GlobalScoreBySimulationEndDate;
import io.openbas.rest.scenario.response.ScenarioStatistic;
import io.openbas.rest.scenario.response.SimulationsResultsLatest;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import io.openbas.utils.AtomicTestingUtils.ResultDistribution;
import io.openbas.utils.ResultUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScenarioStatisticService {

  private final ExerciseRepository exerciseRepository;

  private final ResultUtils resultUtils;

  private static final int GLOBAL_SCORE_PERCENTAGE_NUMBER_OF_DECIMALS = 1;

  public ScenarioStatistic getStatistics(String scenarioId) {
    return new ScenarioStatistic(getSimulationsResultsLatest(scenarioId));
  }

  private SimulationsResultsLatest getSimulationsResultsLatest(String scenarioId) {
    List<RawFinishedExerciseWithInjects> orderedRawFinishedExercises =
        getOrderedRawFinishedExercises(scenarioId);

    Map<ExpectationType, List<GlobalScoreBySimulationEndDate>> globalScoresByExpectationTypes =
        getGlobalScoresByExpectationTypes(orderedRawFinishedExercises);

    return new SimulationsResultsLatest(globalScoresByExpectationTypes);
  }

  private Map<ExpectationType, List<GlobalScoreBySimulationEndDate>>
      getGlobalScoresByExpectationTypes(List<RawFinishedExerciseWithInjects> rawFinishedExercises) {
    List<ExpectationTypeAndGlobalScore> allGlobalScores = getAllGlobalScores(rawFinishedExercises);

    List<GlobalScoreBySimulationEndDate> preventionGlobalScores =
        getGlobalScoresForExpectationType(allGlobalScores, ExpectationType.PREVENTION);
    List<GlobalScoreBySimulationEndDate> detectionGlobalScores =
        getGlobalScoresForExpectationType(allGlobalScores, ExpectationType.DETECTION);
    List<GlobalScoreBySimulationEndDate> humanResponseGlobalScores =
        getGlobalScoresForExpectationType(allGlobalScores, ExpectationType.HUMAN_RESPONSE);

    return new HashMap<>(
        Map.of(
            ExpectationType.PREVENTION, preventionGlobalScores,
            ExpectationType.DETECTION, detectionGlobalScores,
            ExpectationType.HUMAN_RESPONSE, humanResponseGlobalScores));
  }

  private List<ExpectationTypeAndGlobalScore> getAllGlobalScores(
      List<RawFinishedExerciseWithInjects> rawFinishedExercises) {
    return rawFinishedExercises.stream().flatMap(this::getExpectationTypeAndGlobalScores).toList();
  }

  private Stream<ExpectationTypeAndGlobalScore> getExpectationTypeAndGlobalScores(
      RawFinishedExerciseWithInjects rawFinishedExercise) {
    return resultUtils.getResultsByTypes(rawFinishedExercise.getInject_ids()).stream()
        .map(
            expectationResultByType ->
                getExpectationTypeAndGlobalScore(rawFinishedExercise, expectationResultByType));
  }

  private static ExpectationTypeAndGlobalScore getExpectationTypeAndGlobalScore(
      RawFinishedExerciseWithInjects rawFinishedExercise,
      ExpectationResultsByType expectationResultByType) {
    return new ExpectationTypeAndGlobalScore(
        expectationResultByType.type(),
        new GlobalScoreBySimulationEndDate(
            rawFinishedExercise.getExercise_end_date(),
            getPercentageOfInjectsOnSuccess(expectationResultByType)));
  }

  private static List<GlobalScoreBySimulationEndDate> getGlobalScoresForExpectationType(
      List<ExpectationTypeAndGlobalScore> allGlobalScores, ExpectationType expectationType) {
    return allGlobalScores.stream()
        .filter(typeAndScore -> typeAndScore.expectationType == expectationType)
        .map(typeAndScore -> typeAndScore.globalScoreBySimulationEndDate)
        .toList();
  }

  private List<RawFinishedExerciseWithInjects> getOrderedRawFinishedExercises(String scenarioId) {
    List<RawFinishedExerciseWithInjects> rawFinishedExercises =
        exerciseRepository.rawLatestFinishedExercisesWithInjectsByScenarioId(scenarioId);
    Collections.reverse(rawFinishedExercises);
    return rawFinishedExercises;
  }

  private record ExpectationTypeAndGlobalScore(
      ExpectationType expectationType,
      GlobalScoreBySimulationEndDate globalScoreBySimulationEndDate) {}

  private static float getPercentageOfInjectsOnSuccess(
      ExpectationResultsByType expectationResultByType) {
    if (expectationResultByType.distribution().isEmpty()) {
      return 0;
    }
    return getRoundedPercentage(expectationResultByType);
  }

  private static float getRoundedPercentage(ExpectationResultsByType expectationResultByType) {
    return new BigDecimal(
            (getNumberOfInjectsOnSuccess(expectationResultByType)
                    / getTotalNumberOfInjects(expectationResultByType))
                * 100)
        .setScale(GLOBAL_SCORE_PERCENTAGE_NUMBER_OF_DECIMALS, RoundingMode.UP)
        .floatValue();
  }

  private static int getNumberOfInjectsOnSuccess(ExpectationResultsByType expectationResultByType) {
    return expectationResultByType.distribution().getFirst().value();
  }

  private static int getTotalNumberOfInjects(ExpectationResultsByType expectationResultByType) {
    return expectationResultByType.distribution().stream()
        .map(ResultDistribution::value)
        .reduce(0, Integer::sum);
  }
}
