package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
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
    injectExpectation.setResults(List.of(InjectExpectationResult.builder().result("VALIDATED").build()));
    injectExpectation.setScore(input.getScore());
    injectExpectation.setUpdatedAt(now());
    return this.injectExpectationRepository.save(injectExpectation);
  }

}
