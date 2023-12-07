package io.openex.rest.inject.expectation;

import io.openex.database.model.InjectExpectation;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.inject.expectation.form.InjectExpectationInput;
import io.openex.service.InjectExpectationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

@RequiredArgsConstructor
@RestController(value = "/api/exercises/{exerciseId}/injects/{injectId}/expectations") // TODO: valide its work
public class InjectExpectationApi extends RestBehavior {

  private final InjectExpectationService injectExpectationService;

  @PostMapping
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public InjectExpectation createExpectation(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final InjectExpectationInput input) {
    InjectExpectation expectation = new InjectExpectation();
    expectation.setUpdateAttributes(input);
    return this.injectExpectationService.createInjectExpectation(exerciseId, injectId, expectation);
  }

  @GetMapping
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<InjectExpectation> injectExpectations(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String injectId) {
    return this.injectExpectationService.injectExpectations(exerciseId, injectId);
  }

  @PutMapping("/{expectationId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String injectId,
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody final InjectExpectationInput input) {
    InjectExpectation expectation = this.injectExpectationService.injectExpectation(expectationId, injectId,
        expectationId);
    expectation.setUpdateAttributes(input);
    return this.injectExpectationService.updateInjectExpectation(expectation);
  }

  @DeleteMapping("/{expectationId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteInjectExpectation(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String injectId,
      @PathVariable @NotBlank final String expectationId) {
    this.injectExpectationService.deleteInjectExpectation(expectationId);
  }

}
