package io.openex.rest.exercise;

import io.openex.database.model.InjectExpectation;
import io.openex.rest.exercise.form.ExpectationUpdateInput;
import io.openex.rest.helper.RestBehavior;
import io.openex.service.ExerciseExpectationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
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
