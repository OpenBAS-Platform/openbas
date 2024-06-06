package io.openbas.rest.inject;

import io.openbas.database.specification.InjectSpecification;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.output.InjectOutput;
import io.openbas.service.InjectService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;

@RestController
@RequiredArgsConstructor
public class ExerciseInjectApi extends RestBehavior {

  private final InjectService injectService;

  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/simple")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> exerciseInjectsSimple(@PathVariable @NotBlank final String exerciseId) {
    return this.injectService.injects(InjectSpecification.fromExercise(exerciseId));
  }

}
