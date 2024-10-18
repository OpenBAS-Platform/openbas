package io.openbas.rest.variable;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Variable;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.variable.form.VariableInput;
import io.openbas.service.ScenarioService;
import io.openbas.service.VariableService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class VariableApi extends RestBehavior {

  public static final String VARIABLE_URI = "/api/variables";

  private final VariableService variableService;
  private final ScenarioService scenarioService;
  private final ExerciseRepository exerciseRepository;

  // -- EXERCISES --

  @PostMapping(EXERCISE_URI + "/{exerciseId}/variables")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Variable createVariableForExercise(
      @PathVariable @NotBlank final String exerciseId,
      @Valid @RequestBody final VariableInput input) {
    Variable variable = new Variable();
    variable.setUpdateAttributes(input);
    Exercise exercise =
        this.exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    variable.setExercise(exercise);
    return this.variableService.createVariable(variable);
  }

  @GetMapping(EXERCISE_URI + "/{exerciseId}/variables")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Variable> variablesFromExercise(@PathVariable @NotBlank final String exerciseId) {
    return this.variableService.variablesFromExercise(exerciseId);
  }

  @PutMapping(EXERCISE_URI + "/{exerciseId}/variables/{variableId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Variable updateVariableForExercise(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String variableId,
      @Valid @RequestBody final VariableInput input) {
    Variable variable = this.variableService.variable(variableId);
    assert exerciseId.equals(variable.getExercise().getId());
    variable.setUpdateAttributes(input);
    return this.variableService.updateVariable(variable);
  }

  @DeleteMapping(EXERCISE_URI + "/{exerciseId}/variables/{variableId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteVariableForExercise(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String variableId) {
    Variable variable = this.variableService.variable(variableId);
    assert exerciseId.equals(variable.getExercise().getId());
    this.variableService.deleteVariable(variableId);
  }

  // -- SCENARIOS --

  @PostMapping(SCENARIO_URI + "/{scenarioId}/variables")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Variable createVariableForScenario(
      @PathVariable @NotBlank final String scenarioId,
      @Valid @RequestBody final VariableInput input) {
    Variable variable = new Variable();
    variable.setUpdateAttributes(input);
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    variable.setScenario(scenario);
    return this.variableService.createVariable(variable);
  }

  @GetMapping(SCENARIO_URI + "/{scenarioId}/variables")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Iterable<Variable> variablesFromScenario(@PathVariable @NotBlank final String scenarioId) {
    return this.variableService.variablesFromScenario(scenarioId);
  }

  @PutMapping(SCENARIO_URI + "/{scenarioId}/variables/{variableId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Variable updateVariableForScenario(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String variableId,
      @Valid @RequestBody final VariableInput input) {
    Variable variable = this.variableService.variable(variableId);
    assert scenarioId.equals(variable.getScenario().getId());
    variable.setUpdateAttributes(input);
    return this.variableService.updateVariable(variable);
  }

  @DeleteMapping(SCENARIO_URI + "/{scenarioId}/variables/{variableId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public void deleteVariableForScenario(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String variableId) {
    Variable variable = this.variableService.variable(variableId);
    assert scenarioId.equals(variable.getScenario().getId());
    this.variableService.deleteVariable(variableId);
  }
}
