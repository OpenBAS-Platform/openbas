package io.openbas.rest.inject.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class SimulationInjectService {

  private final ExerciseRepository exerciseRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final InjectRepository injectRepository;

  public void deleteInject(@NotBlank final String exerciseId, @NotBlank final String injectId) {
    Exercise exercise =
        this.exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    injectDocumentRepository.deleteDocumentsFromInject(injectId);
    injectRepository.deleteById(injectId);
    exercise.setUpdatedAt(Instant.now());
    this.exerciseRepository.save(exercise);
  }
}
