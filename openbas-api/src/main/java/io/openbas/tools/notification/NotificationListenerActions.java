package io.openbas.tools.notification;

import com.fasterxml.jackson.databind.JsonNode;
import io.openbas.database.audit.BaseEvent;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.Scenario;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.service.ExerciseExpectationService;
import io.openbas.service.ScenarioService;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;

import static io.openbas.service.InjectExpectationUtils.isFulfilled;

@Log
@Service
@RequiredArgsConstructor
public class NotificationListenerActions {

  private final ScenarioService scenarioService;
  private final ExerciseService exerciseService;
  private final ExerciseExpectationService exerciseExpectationService;

  public static final String INJECT_EXPECTATIONS_SCHEMA = "injectexpectations";

  public final Map<String, List<MatchAndBuild>> notificationMatchAndBuild = Map.of(
      INJECT_EXPECTATIONS_SCHEMA,
      List.of(
          MatchAndBuild.builder()
              .match(NotificationListenerActions::matchInjectFromInjectExpectations)
              .buildMessage(NotificationListenerActions::buildMessageForInjectExpectation)
              .build(),
          MatchAndBuild.builder()
              .match(this::matchSimulationFulfilled)
              .buildMessage(this::buildMessageForScenario)
              .build()
      )
  );

  @Builder
  @Getter
  public static class MatchAndBuild {

    private BiFunction<BaseEvent, List<String>, Boolean> match;
    private Function<JsonNode, String> buildMessage;
  }

  // -- INJECT EXPECTATIONS --

  public static final String INJECT_EXPECTATIONS_SCHEMA_INJECT_ID = "inject_expectation_inject";
  public static final String INJECT_EXPECTATIONS_SCHEMA_NAME = "inject_expectation_name";
  public static final String INJECT_EXPECTATIONS_SCHEMA_STATUS = "inject_expectation_status";

  // NOTE: if I update a team expectation, I will have also a player expectation update
  private static boolean matchInjectFromInjectExpectations(BaseEvent event, List<String> values) {
    if (event.getSchema().equals(INJECT_EXPECTATIONS_SCHEMA)) {
      JsonNode injectIdJson = event.getInstanceData().get(INJECT_EXPECTATIONS_SCHEMA_INJECT_ID);
      if (injectIdJson != null) {
        String injectId = injectIdJson.textValue();
        return values.contains(injectId);
      }
    }
    return false;
  }

  private static String buildMessageForInjectExpectation(JsonNode jsonNode) {
    String injectId = jsonNode.get(INJECT_EXPECTATIONS_SCHEMA_INJECT_ID).textValue();
    String injectExpectationName = jsonNode.get(INJECT_EXPECTATIONS_SCHEMA_NAME).textValue();
    String injectExpectationStatus = jsonNode.get(INJECT_EXPECTATIONS_SCHEMA_STATUS).textValue();
    return "<div>"
        + "<br/><br/><br/><br/>"
        + "---------------------------------------------------------------------------------<br/>"
        + "Notification for inject " + injectId + " and expectation " + injectExpectationName + "<br/>"
        + "Result: " + injectExpectationStatus + "<br/>"
        + "---------------------------------------------------------------------------------<br/>"
        + "<div>";
  }

  // -- SCENARIOS --

  public static final String INJECT_EXPECTATIONS_SCHEMA_SIMULATION_ID = "inject_expectation_exercise";

  private boolean matchSimulationFulfilled(BaseEvent event, List<String> values) {
    if (event.getSchema().equals(INJECT_EXPECTATIONS_SCHEMA)) {
      JsonNode simulationIdJson = event.getInstanceData().get(INJECT_EXPECTATIONS_SCHEMA_SIMULATION_ID);
      if (simulationIdJson != null) {
        String simulationId = simulationIdJson.textValue();
        Scenario scenario = this.scenarioService.scenarioFromSimulationId(simulationId);
        if (values.contains(scenario.getId())) {
          Exercise simulation = this.exerciseService.exercise(simulationId);
          if (simulation.getEnd().isPresent()) { // Is finished
            List<InjectExpectation> injectExpectations = this.exerciseExpectationService.injectExpectations(
                simulationId);
            return isFulfilled(injectExpectations);
          }
        }
      }
    }
    return false;
  }

  private String buildMessageForScenario(JsonNode jsonNode) {
    String simulationId = jsonNode.get(INJECT_EXPECTATIONS_SCHEMA_SIMULATION_ID).textValue();
    Exercise simulation = this.exerciseService.exercise(simulationId);
    if (simulation.getEnd().isEmpty()){
      return "Error";
    }
    List<ExpectationResultsByType> results = this.exerciseService.getGlobalResults(simulationId);
    Scenario scenario = this.scenarioService.scenarioFromSimulationId(simulationId);
    Exercise previousSimulation = this.exerciseService
        .previousFinishedSimulation(scenario.getId(), simulation.getEnd().orElse(null));
    String body = "";
    if (previousSimulation != null) {
      body = "diff"; // FIXME: need to have widget on back-end
      // DIFF
    } else {
      body = "first one"; // FIXME: need to have widget on back-end
      // Only last one
    }
    return "<div>"
        + "<br/><br/><br/><br/>"
        + "---------------------------------------------------------------------------------<br/>"
        + "Notification for inject " + body
        + "---------------------------------------------------------------------------------<br/>"
        + "<div>";
  }

}
