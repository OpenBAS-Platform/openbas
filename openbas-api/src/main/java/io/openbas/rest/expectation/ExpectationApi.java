package io.openbas.rest.expectation;

import io.openbas.database.model.InjectExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.ExerciseExpectationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class ExpectationApi extends RestBehavior {

  private final ExerciseExpectationService exerciseExpectationService;

  @PutMapping("/api/expectations/{expectationId}")
  public InjectExpectation updateInjectExpectation(
      @PathVariable @NotBlank final String expectationId,
      @Valid @RequestBody final ExpectationUpdateInput input) {
    return this.exerciseExpectationService.updateInjectExpectation(expectationId, input);
  }

}
