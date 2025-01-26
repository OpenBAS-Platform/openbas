package io.openbas.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectExpectationRepository;
import jakarta.validation.constraints.NotBlank;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ExerciseExpectationService {

  private final InjectExpectationRepository injectExpectationRepository;
  private final ExerciseRepository exerciseRepository;

  public List<InjectExpectation> injectExpectations(@NotBlank final String exerciseId) {
    Exercise exercise = this.exerciseRepository.findById(exerciseId).orElseThrow();
    return this.injectExpectationRepository.findAllForExercise(exercise.getId());
  }
}
