package io.openbas.rest.scenario;

import io.openbas.database.model.Exercise;
import io.openbas.database.repository.*;
import io.openbas.rest.exercise.ExerciseService;
import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.ExerciseSpecification.fromScenario;
import static io.openbas.rest.exercise.form.ExerciseSimple.fromExercise;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class ScenarioExerciseApi {

  private final ExerciseService exerciseService;
  private final ExerciseRepository exerciseRepository;
  private final InjectRepository injectRepository;
  private final InjectExpectationRepository injectExpectationRepository;
  private final TeamRepository teamRepository;
  private final AssetRepository assetRepository;
  private final AssetGroupRepository assetGroupRepository;

  @GetMapping(SCENARIO_URI + "/{scenarioId}/exercises")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Iterable<ExerciseSimple> scenarioExercises(@PathVariable @NotBlank final String scenarioId) {
    return this.exerciseRepository.findAll(fromScenario(scenarioId))
        .stream().map(exercise -> fromExercise(exercise, injectRepository, injectExpectationRepository, teamRepository,
            assetRepository, assetGroupRepository)).toList();
  }

  @PostMapping(SCENARIO_URI + "/{scenarioId}/exercises/search")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Iterable<ExerciseSimple> scenarioExercises(
      @PathVariable @NotBlank final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationCriteriaBuilder(
        (Specification<Exercise> specification, Specification<Exercise> specificationCount, Pageable pageable) -> this.exerciseService.exercises(
            fromScenario(scenarioId).and(specification),
            fromScenario(scenarioId).and(specificationCount),
            pageable
        ),
        searchPaginationInput,
        Exercise.class
    );
  }

}
