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
import java.util.*;
import java.util.function.BinaryOperator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScenarioStatisticService {

  private final ExerciseRepository exerciseRepository;

  private final ResultUtils resultUtils;

  public ScenarioStatistic getStatistics(String scenarioId) {
    return getLatestSimulationsStatistics(scenarioId);
  }

  private ScenarioStatistic getLatestSimulationsStatistics(String scenarioId) {
    List<RawFinishedExerciseWithInjects> rawFinishedExercises =
        exerciseRepository.rawLatestFinishedExercisesWithInjectsByScenarioId(scenarioId);
    Collections.reverse(rawFinishedExercises);

    Map<ExpectationType, List<GlobalScoreBySimulationEndDate>>
        initialGlobalScoresByExpectationType = new HashMap<>();
    initialGlobalScoresByExpectationType.put(ExpectationType.PREVENTION, new ArrayList<>());
    initialGlobalScoresByExpectationType.put(ExpectationType.DETECTION, new ArrayList<>());
    initialGlobalScoresByExpectationType.put(ExpectationType.HUMAN_RESPONSE, new ArrayList<>());

    Map<ExpectationType, List<GlobalScoreBySimulationEndDate>> globalScoresByExpectationType =
        rawFinishedExercises.stream()
            .reduce(
                initialGlobalScoresByExpectationType,
                (scoresByType, rawFinishedExercise) ->
                    addGlobalScores(
                        scoresByType,
                        rawFinishedExercise,
                        resultUtils.getResultsByTypes(rawFinishedExercise.getInject_ids())),
                getMapBinaryOperator());

    return new ScenarioStatistic(new SimulationsResultsLatest(globalScoresByExpectationType));
  }

  private static Map<ExpectationType, List<GlobalScoreBySimulationEndDate>> addGlobalScores(
      Map<ExpectationType, List<GlobalScoreBySimulationEndDate>> globalScoresByExpectationType,
      RawFinishedExerciseWithInjects rawFinishedExercise,
      List<ExpectationResultsByType> expectationResultsByType) {

    updateGlobalScores(
        globalScoresByExpectationType,
        rawFinishedExercise,
        expectationResultsByType,
        ExpectationType.PREVENTION);

    updateGlobalScores(
        globalScoresByExpectationType,
        rawFinishedExercise,
        expectationResultsByType,
        ExpectationType.DETECTION);

    updateGlobalScores(
        globalScoresByExpectationType,
        rawFinishedExercise,
        expectationResultsByType,
        ExpectationType.HUMAN_RESPONSE);

    return globalScoresByExpectationType;
  }

  private static void updateGlobalScores(
      Map<ExpectationType, List<GlobalScoreBySimulationEndDate>> globalScoresByExpectationType,
      RawFinishedExerciseWithInjects rawFinishedExercise,
      List<ExpectationResultsByType> expectationResultsByType,
      ExpectationType expectationType) {
    List<GlobalScoreBySimulationEndDate> globalScores =
        getGlobalScoresBySimulationEndDates(
            rawFinishedExercise, expectationResultsByType, expectationType);
    updateGlobalScoresByExpectationType(
        globalScoresByExpectationType, globalScores, expectationType);
  }

  private static void updateGlobalScoresByExpectationType(
      Map<ExpectationType, List<GlobalScoreBySimulationEndDate>> globalScoresByType,
      List<GlobalScoreBySimulationEndDate> globalScores,
      ExpectationType expectationType) {
    List<GlobalScoreBySimulationEndDate> previousGlobalScores =
        globalScoresByType.getOrDefault(expectationType, new ArrayList<>());
    previousGlobalScores.addAll(globalScores);
    globalScoresByType.put(expectationType, previousGlobalScores);
  }

  private static List<GlobalScoreBySimulationEndDate> getGlobalScoresBySimulationEndDates(
      RawFinishedExerciseWithInjects rawFinishedExercise,
      List<ExpectationResultsByType> expectationResultsByType,
      ExpectationType expectationType) {

    return expectationResultsByType.stream()
        .filter(expectationResultByType -> expectationResultByType.type() == expectationType)
        .map(
            expectationResultByType ->
                new GlobalScoreBySimulationEndDate(
                    rawFinishedExercise.getExercise_end_date(),
                    getPercentageOfInjectsOnSuccess(expectationResultByType)))
        .toList();
  }

  private static float getPercentageOfInjectsOnSuccess(
      ExpectationResultsByType expectationResultByType) {
    if (expectationResultByType.distribution().isEmpty()) {
      return 0;
    }
    var totalNumberOfInjects =
        expectationResultByType.distribution().stream()
            .map(ResultDistribution::value)
            .reduce(0, Integer::sum);
    var numberOfInjectsOnSuccess = expectationResultByType.distribution().getFirst().value();
    return (float) numberOfInjectsOnSuccess / totalNumberOfInjects;
  }

  private static BinaryOperator<Map<ExpectationType, List<GlobalScoreBySimulationEndDate>>>
      getMapBinaryOperator() {
    return (m1, m2) -> {
      m1.putAll(m2);
      return m1;
    };
  }
}
