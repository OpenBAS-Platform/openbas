package io.openbas.rest.exercise;

import io.openbas.database.model.InjectExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ExerciseExpectationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class ExerciseExpectationApi extends RestBehavior {

  private final ExerciseExpectationService exerciseExpectationService;

  @GetMapping(value = "/api/exercises/{exerciseId}/expectations")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public List<InjectExpectation> exerciseInjectExpectations(@PathVariable @NotBlank final String exerciseId) {
    return this.exerciseExpectationService.injectExpectations(exerciseId);
  }

  @PutMapping("/api/exercises/{exerciseId}/expectations/{expectationId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody final ExpectationUpdateInput input) {
    return this.exerciseExpectationService.updateInjectExpectation(expectationId, input);
  }

}
