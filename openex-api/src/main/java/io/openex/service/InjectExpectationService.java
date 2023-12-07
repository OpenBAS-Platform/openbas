package io.openex.service;

import io.openex.database.model.Exercise;
import io.openex.database.model.Inject;
import io.openex.database.model.InjectExpectation;
import io.openex.database.repository.ExerciseRepository;
import io.openex.database.repository.InjectExpectationRepository;
import io.openex.database.repository.InjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class InjectExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;
  private final ExerciseRepository exerciseRepository;
  private final InjectRepository injectRepository;

  public InjectExpectation createInjectExpectation(
      @NotBlank final String exerciseId,
      @NotBlank final String injectId,
      @NotNull final InjectExpectation expectation) {
    Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
    expectation.setExercise(exercise);
    expectation.setInject(inject);
    return this.injectExpectationRepository.save(expectation);
  }

  public InjectExpectation injectExpectation(
      @NotBlank final String exerciseId,
      @NotBlank final String injectId,
      @NotBlank final String expectationId) {
    return this.injectExpectationRepository.findById(expectationId).orElseThrow();
  }

  public List<InjectExpectation> injectExpectations(
      @NotBlank final String exerciseId,
      @NotBlank final String injectId) {
    return this.injectExpectationRepository.findAllForExerciseAndInject(exerciseId, injectId).stream().toList();
  }

  public InjectExpectation updateInjectExpectation(@NotNull final InjectExpectation expectation) {
    expectation.setUpdatedAt(now());
    return this.injectExpectationRepository.save(expectation);
  }

  public void deleteInjectExpectation(@NotBlank final String expectationId) {
    this.injectExpectationRepository.deleteById(expectationId);
  }

}
