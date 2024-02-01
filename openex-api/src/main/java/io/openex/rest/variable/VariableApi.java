package io.openex.rest.variable;

import io.openex.database.model.Variable;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.variable.form.VariableInput;
import io.openex.service.VariableService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static io.openex.database.model.User.ROLE_USER;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class VariableApi extends RestBehavior {

  private final VariableService variableService;

  @PostMapping("/api/exercises/{exerciseId}/variables")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Variable createVariable(
      @PathVariable @NotBlank final String exerciseId,
      @Valid @RequestBody final VariableInput input) {
    Variable variable = new Variable();
    variable.setUpdateAttributes(input);
    return this.variableService.createVariable(exerciseId, variable);
  }

  @GetMapping("/api/exercises/{exerciseId}/variables")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Variable> variables(@PathVariable @NotBlank final String exerciseId) {
    return this.variableService.variablesFromExercise(exerciseId);
  }

  @PutMapping("/api/exercises/{exerciseId}/variables/{variableId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Variable updateVariable(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String variableId,
      @Valid @RequestBody final VariableInput input) {
    Variable variable = this.variableService.variable(variableId);
    variable.setUpdateAttributes(input);
    return this.variableService.updateVariable(variable);
  }

  @DeleteMapping("/api/exercises/{exerciseId}/variables/{variableId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteVariable(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String variableId) {
    this.variableService.deleteVariable(variableId);
  }

}
