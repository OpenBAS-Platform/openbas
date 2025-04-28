package io.openbas.notification.handler;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.*;
import io.openbas.expectation.ExpectationType;
import io.openbas.notification.model.NotificationEvent;
import io.openbas.notification.model.NotificationEventType;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.rest.scenario.service.ScenarioStatisticService;
import io.openbas.service.NotificationRuleService;
import io.openbas.service.ScenarioService;
import io.openbas.utils.AtomicTestingUtils;
import jakarta.validation.constraints.NotNull;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
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

      // create map with the results to facilitate the computing of the score difference
      // TODO update exerciseService to return a map with result
      Map<ExpectationType, AtomicTestingUtils.ExpectationResultsByType> lastSimulationResultsMap =
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

      if (exerciseService.isThereAScoreDegradation(
          lastSimulationResultsMap, secondLastSimulationResultsMap)) {

        // notify
        notificationRuleService.activateNotificationRules(
            lastSimulation.getScenario().getId(),
            NotificationRuleTrigger.DIFFERENCE,
            buildScenarioNotificationData(
                lastSimulation.getScenario().getId(),
                lastSimulation,
                secondLastSimulation,
                lastSimulationResultsMap,
                secondLastSimulationResultsMap));
      }
    }
  }

  private Map<String, String> buildScenarioNotificationData(
      @NotNull final String scenarioId,
      @NotNull final Exercise lastSimulation,
      @NotNull final Exercise secondLastSimulation,
      @NotNull
          final Map<ExpectationType, AtomicTestingUtils.ExpectationResultsByType>
              lastSimulationResultsMap,
      @NotNull
          final Map<ExpectationType, AtomicTestingUtils.ExpectationResultsByType>
              secondLastSimulationResultsMap) {
    // TODO handle date format dynamically
    DateTimeFormatter formatter =
        DateTimeFormatter.ofPattern("yyyy/MM/dd").withZone(ZoneId.systemDefault());

    Scenario scenario = scenarioService.scenario(scenarioId);
    String url = openBASConfig.getBaseUrl();
    float lastSimulationPrevScore =
        ScenarioStatisticService.getRoundedPercentage(
            lastSimulationResultsMap.get(ExpectationType.PREVENTION));
    float lastSimulationDetectScore =
        ScenarioStatisticService.getRoundedPercentage(
            lastSimulationResultsMap.get(ExpectationType.DETECTION));
    float secondLastSimulationPrevScore =
        ScenarioStatisticService.getRoundedPercentage(
            secondLastSimulationResultsMap.get(ExpectationType.PREVENTION));
    float secondLastSimulationDetectScore =
        ScenarioStatisticService.getRoundedPercentage(
            secondLastSimulationResultsMap.get(ExpectationType.DETECTION));
    float decreasePrev = secondLastSimulationPrevScore - lastSimulationPrevScore;
    float decreaseDetect = secondLastSimulationDetectScore - lastSimulationDetectScore;

    Map<String, String> data = new HashMap<>();
    data.put("decrease_prev", Float.toString(decreasePrev));
    data.put("decrease_detect", Float.toString(decreaseDetect));
    data.put("prev_simulation_date", lastSimulation.getEnd().map(formatter::format).orElse("NA"));
    data.put("prev_percentage_detection", Float.toString(lastSimulationDetectScore));
    data.put("prev_percentage_prevention", Float.toString(secondLastSimulationDetectScore));
    data.put(
        "new_simulation_date", secondLastSimulation.getEnd().map(formatter::format).orElse("NA"));
    data.put("new_percentage_detection", Float.toString(lastSimulationDetectScore));
    data.put("new_percentage_prevention", Float.toString(lastSimulationPrevScore));
    data.put("scenarioLink", String.format("%s/admin/scenarios/%s", url, scenarioId));
    data.put("instanceLink", url);
    data.put("scenario_name", scenario.getName());
    return data;
  }
}
