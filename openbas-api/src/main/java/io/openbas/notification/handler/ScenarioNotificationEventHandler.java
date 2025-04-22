package io.openbas.notification.handler;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.NotificationRule;
import io.openbas.database.model.NotificationRuleTrigger;
import io.openbas.database.model.Scenario;
import io.openbas.expectation.ExpectationType;
import io.openbas.notification.model.NotificationEvent;
import io.openbas.notification.model.NotificationEventType;
import io.openbas.rest.exercise.form.ExercisesGlobalScoresInput;
import io.openbas.rest.exercise.response.ExercisesGlobalScoresOutput;
import io.openbas.rest.exercise.service.ExerciseService;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import io.openbas.rest.scenario.service.ScenarioStatisticService;
import io.openbas.service.NotificationRuleService;
import io.openbas.service.ScenarioService;
import io.openbas.utils.AtomicTestingUtils;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScenarioNotificationEventHandler implements NotificationEventHandler {
  private final OpenBASConfig openBASConfig;
  private final ExerciseService exerciseService;
  private final ScenarioService scenarioService;
  private final NotificationRuleService notificationRuleService;

  @Override
  public void handle(NotificationEvent event) {
    if (NotificationEventType.SIMULATION_COMPLETED.equals(event.getEventType())) {
      // get the last 2 simulations
      Exercise lastSimulation =
          exerciseService.previousFinishedSimulation(event.getResourceId(), event.getTimestamp());
      if (lastSimulation == null || lastSimulation.getEnd().isEmpty()) {
        return;
      }
      Exercise secondLastSimulation =
          exerciseService.previousFinishedSimulation(
              event.getResourceId(), lastSimulation.getEnd().get());
      if (secondLastSimulation == null) {
        return;
      }

      // calculate if there is a score degradation
      ExercisesGlobalScoresInput exercisesGlobalScoresInput =
          new ExercisesGlobalScoresInput(
              List.of(lastSimulation.getId(), secondLastSimulation.getId()));
      ExercisesGlobalScoresOutput exercisesGlobalScoresOutput =
          exerciseService.getExercisesGlobalScores(exercisesGlobalScoresInput);

      //create map with the results to facilitate the computing of the score difference
      //TODO update exerciseService to return a map with result
      Map<ExpectationType, AtomicTestingUtils.ExpectationResultsByType>
              lastSimulationResultsMap =
              exerciseService.getGlobalResults(lastSimulation.getId()).stream()
                      .collect(
                              Collectors.toMap(
                                      AtomicTestingUtils.ExpectationResultsByType::type, Function.identity()));
      Map<ExpectationType, AtomicTestingUtils.ExpectationResultsByType>
        secondLastSimulationResultsMap =
              exerciseService.getGlobalResults(secondLastSimulation.getId()).stream()
                .collect(
                    Collectors.toMap(
                        AtomicTestingUtils.ExpectationResultsByType::type, Function.identity()));

      if (exerciseService.isThereAScoreDegradation(lastSimulationResultsMap, secondLastSimulationResultsMap)) {

        //notify
        notificationRuleService.activateNotificationRules(
                lastSimulation.getScenario().getId(),
                NotificationRuleTrigger.DIFFERENCE,
                buildScenarioNotificationData(lastSimulation.getScenario().getId(),
                        lastSimulation,
                        secondLastSimulation,
                        lastSimulationResultsMap,
                        secondLastSimulationResultsMap
                ) );
      }
    }
  }

  private Map<String,String> buildScenarioNotificationData(@NotNull final String scenarioId,
                                                           @NotNull final Exercise lastSimulation,
                                                           @NotNull final Exercise secondLastSimulation,
                                                           @NotNull final Map<ExpectationType, AtomicTestingUtils.ExpectationResultsByType> lastSimulationResultsMap,
                                                           @NotNull final Map<ExpectationType, AtomicTestingUtils.ExpectationResultsByType> secondLastSimulationResultsMap) {

    Scenario scenario = scenarioService.scenario(scenarioId);
    String url = openBASConfig.getBaseUrl();
    float lastSimulationPrevScore = ScenarioStatisticService.getRoundedPercentage(lastSimulationResultsMap.get(ExpectationType.PREVENTION));
    float lastSimulationDetectScore = ScenarioStatisticService.getRoundedPercentage(lastSimulationResultsMap.get(ExpectationType.DETECTION));
    float secondLastSimulationPrevScore = ScenarioStatisticService.getRoundedPercentage(lastSimulationResultsMap.get(ExpectationType.PREVENTION));
    float secondLastSimulationDetectScore = ScenarioStatisticService.getRoundedPercentage(lastSimulationResultsMap.get(ExpectationType.DETECTION));
    float decreasePrev = secondLastSimulationPrevScore - lastSimulationPrevScore;
    float decreaseDetect = secondLastSimulationDetectScore - lastSimulationDetectScore;
    Map<String,String> data = new HashMap<>();
    data.put("decrease_prev", Float.toString(decreasePrev));
    data.put("decrease_detect", Float.toString(decreaseDetect));
    data.put("prev_simulation_date", secondLastSimulation.getEnd().map(Instant::toString).orElse("NA"));
    data.put("prev_percentage_detection", Float.toString(lastSimulationPrevScore));
    data.put("prev_percentage_prevention", Float.toString(lastSimulationDetectScore));
    data.put("new_simulation_date", lastSimulation.getEnd().map(Instant::toString).orElse("NA"));
    data.put("new_percentage_detection", Float.toString(secondLastSimulationDetectScore));
    data.put("new_percentage_prevention", Float.toString(secondLastSimulationPrevScore));
    data.put("scenarioLink", String.format("%s/admin/scenarios/%s", url, scenarioId));
    data.put("instanceLink", url);
    data.put("scenario_name", scenario.getName());
    return data;
  }
}
