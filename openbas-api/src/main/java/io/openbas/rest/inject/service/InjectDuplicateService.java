package io.openbas.rest.inject.service;

import static io.openbas.utils.StringUtils.duplicateString;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.InjectUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@RequiredArgsConstructor
@Validated
public class InjectDuplicateService {

  private final ExerciseRepository exerciseRepository;
  private final ScenarioRepository scenarioRepository;
  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;

  @Transactional
  public Inject duplicateInjectForScenario(Scenario scenario, Inject inject) {
    Inject duplicatedInject = getDuplicatedInjectWithScenario(scenario, inject);
    return saveInject(inject, duplicatedInject);
  }

  @Transactional
  public Inject duplicateInjectForScenarioWithDuplicateWordInTitle(
      final String scenarioId, final String injectId) {
    Scenario scenario =
        scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);
    Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    Inject duplicatedInject = getDuplicatedInjectWithScenario(scenario, inject);
    duplicatedInject.setTitle(duplicateString(duplicatedInject.getTitle()));
    return saveInject(inject, duplicatedInject);
  }

  @Transactional
  public Inject duplicateInjectForExercise(Exercise exercise, Inject inject) {
    Inject duplicatedInject = getDuplicatedInjectWithExercise(exercise, inject);
    return saveInject(inject, duplicatedInject);
  }

  @Transactional
  public Inject duplicateInjectForExerciseWithDuplicateWordInTitle(
      final String exerciseId, final String injectId) {
    Exercise exercise =
        exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    Inject duplicatedInject = getDuplicatedInjectWithExercise(exercise, inject);
    duplicatedInject.setTitle(duplicateString(duplicatedInject.getTitle()));
    return saveInject(inject, duplicatedInject);
  }

  private Inject getDuplicatedInjectWithScenario(Scenario scenario, Inject inject) {
    Inject duplicatedInject = InjectUtils.duplicateInject(inject);
    duplicatedInject.setScenario(scenario);
    duplicatedInject.setExercise(null);
    return duplicatedInject;
  }

  private Inject getDuplicatedInjectWithExercise(Exercise exercise, Inject inject) {
    Inject duplicatedInject = InjectUtils.duplicateInject(inject);
    duplicatedInject.setExercise(exercise);
    duplicatedInject.setScenario(null);
    return duplicatedInject;
  }

  private Inject saveInject(Inject inject, Inject duplicatedInject) {
    Inject savedInject = injectRepository.save(duplicatedInject);
    addInjectDocumentsToDuplicatedInject(inject, savedInject);
    return savedInject;
  }

  private void addInjectDocumentsToDuplicatedInject(Inject injectOrigin, Inject duplicatedInject) {
    injectOrigin
        .getDocuments()
        .forEach(
            injectDocument -> {
              String documentId = injectDocument.getDocument().getId();
              injectDocumentRepository.addInjectDoc(
                  duplicatedInject.getId(), documentId, injectDocument.isAttached());
            });
  }
}
