package io.openbas.rest.scenario;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.ExerciseSpecification.fromScenario;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Exercise;
import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class ScenarioExerciseApi {

  private final ExerciseService exerciseService;

  @LogExecutionTime
  @GetMapping(SCENARIO_URI + "/{scenarioId}/exercises")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Iterable<ExerciseSimple> scenarioExercises(
      @PathVariable @NotBlank final String scenarioId) {
    return exerciseService.scenarioExercises(scenarioId);
  }

  @LogExecutionTime
  @PostMapping(SCENARIO_URI + "/{scenarioId}/exercises/search")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Iterable<ExerciseSimple> scenarioExercises(
      @PathVariable @NotBlank final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationCriteriaBuilder(
        (Specification<Exercise> specification,
            Specification<Exercise> specificationCount,
            Pageable pageable) ->
            this.exerciseService.exercises(
                fromScenario(scenarioId).and(specification),
                fromScenario(scenarioId).and(specificationCount),
                pageable),
        searchPaginationInput,
        Exercise.class);
  }
}
