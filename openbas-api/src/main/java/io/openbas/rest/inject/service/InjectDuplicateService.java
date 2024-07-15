package io.openbas.rest.inject.service;

import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.service.AtomicTestingService;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
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
    private final AtomicTestingService atomicTestingService;

    @Transactional
    public Inject createInjectForScenario(@NotBlank final String scenarioId, @NotBlank final String injectId, boolean isChild) {
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow();
        Inject injectOrigin = injectRepository.findById(injectId).orElseThrow();
        Inject injectDuplicate = atomicTestingService.copyInject(injectOrigin, isChild);
        injectDuplicate.setScenario(scenario);
        Inject saved = injectRepository.save(injectDuplicate);
        getDocumentList(saved, injectId);
        return saved;
    }

    @Transactional
    public Inject createInjectForExercise(@NotBlank final String exerciseId, @NotBlank final String injectId, boolean isChild) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Inject injectOrigin = injectRepository.findById(injectId).orElseThrow();
        Inject inject = atomicTestingService.copyInject(injectOrigin, isChild);
        inject.setExercise(exercise);
        Inject saved = injectRepository.save(inject);
        getDocumentList(saved, injectId);
        return saved;
    }

    private void getDocumentList(@NotNull final Inject injectDuplicate, @NotNull final String injectId) {
        Inject injectOrigin = injectRepository.findById(injectId).orElseThrow();
        injectOrigin.getDocuments().forEach(injectDocument -> {
            String documentId = injectDocument.getDocument().getId();
            injectDocumentRepository.addInjectDoc(injectDuplicate.getId(), documentId, injectDocument.isAttached());
        });
    }
}
