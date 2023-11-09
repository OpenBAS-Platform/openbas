package io.openex.service;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Exercise;
import io.openex.database.model.Injection;
import io.openex.database.model.User;
import io.openex.database.model.Variable;
import io.openex.database.repository.VariableRepository;
import io.openex.database.specification.VariableSpecification;
import io.openex.execution.ExecutionContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

import static io.openex.contract.variables.VariableHelper.*;

@RequiredArgsConstructor
@Service
public class ExecutionContextService {

  @Resource
  private final OpenExConfig openExConfig;

  private final VariableRepository variableRepository;


  public ExecutionContext executionContext(@NotNull final User user, Injection injection, String audience) {
    return this.executionContext(user, injection, List.of(audience));
  }

  public ExecutionContext executionContext(@NotNull final User user, Injection injection, List<String> audiences) {
    ExecutionContext executionContext = new ExecutionContext(user, injection.getExercise(), audiences);
    if (injection.getExercise() != null) {
      String exerciseId = injection.getExercise().getId();
      String queryParams = "?user=" + user.getId() + "&inject=" + injection.getId();
      String baseUrl = this.openExConfig.getBaseUrl();
      executionContext.put(PLAYER_URI, baseUrl + "/private/" + exerciseId + queryParams);
      executionContext.put(CHALLENGES_URI, baseUrl + "/challenges/" + exerciseId + queryParams);
      executionContext.put(SCOREBOARD_URI, baseUrl + "/scoreboard/" + exerciseId + queryParams);
      executionContext.put(LESSONS_URI, baseUrl + "/lessons/" + exerciseId + queryParams);
      fillDynamicVariable(executionContext, exerciseId);
    }
    return executionContext;
  }

  public ExecutionContext executionContext(@NotNull final User user, Exercise exercise, String audience) {
    ExecutionContext executionContext = new ExecutionContext(user, exercise, List.of(audience));
    if (exercise != null) {
      fillDynamicVariable(executionContext, exercise.getId());
    }
    return executionContext;
  }

  // -- PRIVATE --

  private void fillDynamicVariable(@NotNull ExecutionContext executionContext, @NotBlank final String exerciseId) {
    List<Variable> variables = this.variableRepository.findAll(VariableSpecification.fromExercise(exerciseId));
    variables.forEach((v) -> executionContext.put(v.getKey(), v.getValue()));
  }

}
