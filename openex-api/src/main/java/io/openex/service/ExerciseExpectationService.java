package io.openex.service;

import io.openex.database.model.Exercise;
import io.openex.database.model.InjectExpectation;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectExpectationRepository;
import io.openex.rest.exercise.form.ExpectationUpdateInput;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class ExerciseExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;
  private final ExerciseRepository exerciseRepository;

  public List<InjectExpectation> injectExpectations(@NotBlank final String exerciseId) {
    Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
    return this.injectExpectationRepository.findAllForExercise(exercise.getId());
  }

  public InjectExpectation updateInjectExpectation(
      @NotBlank final String expectationId,
      @NotNull final ExpectationUpdateInput input) {
    InjectExpectation injectExpectation = this.injectExpectationRepository.findById(expectationId).orElseThrow();
    injectExpectation.setResult("VALIDATED");
    injectExpectation.setScore(input.getScore());
    injectExpectation.setUpdatedAt(now());
    return this.injectExpectationRepository.save(injectExpectation);
  }

}
