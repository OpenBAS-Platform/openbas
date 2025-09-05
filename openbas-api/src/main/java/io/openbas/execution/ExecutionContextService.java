package io.openbas.execution;

import static io.openbas.injector_contract.variables.VariableHelper.*;

import io.openbas.config.OpenBASConfig;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Injection;
import io.openbas.database.model.User;
import io.openbas.database.model.Variable;
import io.openbas.service.VariableService;
import jakarta.annotation.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ExecutionContextService {

  @Resource private final OpenBASConfig openBASCOnfig;

  private final VariableService variableService;

  public ExecutionContext executionContext(
      @NotNull final User user, Injection injection, String team) {
    return this.executionContext(user, injection, List.of(team));
  }

  public ExecutionContext executionContext(
      @NotNull final User user, Injection injection, List<String> teams) {
    ExecutionContext executionContext = new ExecutionContext(user, teams);
    if (injection.getExercise() != null) {
      String exerciseId = injection.getExercise().getId();
      String queryParams = "?user=" + user.getId() + "&inject=" + injection.getId();
      String baseUrl = this.openBASCOnfig.getBaseUrl();
      executionContext.put(PLAYER_URI, baseUrl + "/private/" + exerciseId + queryParams);
      executionContext.put(CHALLENGES_URI, baseUrl + "/challenges/" + exerciseId + queryParams);
      executionContext.put(SCOREBOARD_URI, baseUrl + "/scoreboard/" + exerciseId + queryParams);
      executionContext.put(
          LESSONS_URI, baseUrl + "/lessons/simulation/" + exerciseId + queryParams);
      executionContext.put(EXERCISE, injection.getExercise());
      fillDynamicSimulationVariable(executionContext, exerciseId);
    } else if (injection.getScenario() != null) {
      fillDynamicScenarioVariable(executionContext, injection.getScenario().getId());
    }

    return executionContext;
  }

  public ExecutionContext executionContext(
      @NotNull final User user, Exercise exercise, String team) {
    ExecutionContext executionContext = new ExecutionContext(user, List.of(team));
    if (exercise != null) {
      fillDynamicSimulationVariable(executionContext, exercise.getId());
    }
    return executionContext;
  }

  // -- PRIVATE --

  private void fillDynamicSimulationVariable(
      @NotNull ExecutionContext executionContext, @NotBlank final String exerciseId) {
    List<Variable> variables = this.variableService.variablesFromExercise(exerciseId);
    variables.forEach((v) -> executionContext.put(v.getKey(), v.getValue()));
  }

  private void fillDynamicScenarioVariable(
      @NotNull ExecutionContext executionContext, @NotBlank final String scenarioId) {
    List<Variable> variables = this.variableService.variablesFromScenario(scenarioId);
    variables.forEach((v) -> executionContext.put(v.getKey(), v.getValue()));
  }
}
