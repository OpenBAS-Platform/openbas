package io.openbas.rest.exercise;

import io.openbas.aop.LogExecutionTime;
import io.openbas.aop.RBAC;
import io.openbas.database.model.Action;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.ResourceType;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ExerciseExpectationService;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class ExerciseExpectationApi extends RestBehavior {

  private final ExerciseExpectationService exerciseExpectationService;

  @LogExecutionTime
  @GetMapping(value = "/api/exercises/{exerciseId}/expectations")
  @RBAC(
      resourceId = "#exerciseId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.SIMULATION)
  
  public List<InjectExpectation> exerciseInjectExpectations(
      @PathVariable @NotBlank final String exerciseId) {
    return this.exerciseExpectationService.injectExpectations(exerciseId);
  }
}
