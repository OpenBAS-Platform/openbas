package io.openex.service;

import io.openex.database.model.Exercise;
import io.openex.database.model.InjectExpectation;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectExpectationRepository;
import io.openex.rest.exercise.form.ExpectationUpdateInput;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
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

  public Iterable<InjectExpectation> updateInjectExpectations(@NotNull final List<ExpectationUpdateInput> inputs) {
    Iterable<InjectExpectation> injectExpectations = this.injectExpectationRepository
        .findAllById(inputs.stream().map(ExpectationUpdateInput::getId).toList());
    injectExpectations.forEach((e) -> {
      Integer score = inputs.stream()
          .filter((i) -> i.getId().equals(e.getId()))
          .findFirst()
          .orElseThrow()
          .getScore();
      e.setScore(score);
      if (score != null) {
        e.setResult("VALIDATED");
      }
      e.setUpdatedAt(now());
    });
    return this.injectExpectationRepository.saveAll(injectExpectations);
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
