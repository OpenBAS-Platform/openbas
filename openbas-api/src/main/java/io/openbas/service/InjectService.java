package io.openbas.service;

import io.openbas.database.model.Execution;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.ExecutionTrace.traceSuccess;
import static java.time.Instant.now;

@Service
public class InjectService {

    private InjectDocumentRepository injectDocumentRepository;
    private InjectRepository injectRepository;

    @Autowired
    public void setInjectDocumentRepository(InjectDocumentRepository injectDocumentRepository) {
        this.injectDocumentRepository = injectDocumentRepository;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    public void cleanInjectsDocExercise(String exerciseId, String documentId) {
        // Delete document from all exercise injects
        List<Inject> exerciseInjects = injectRepository.findAllForExerciseAndDoc(exerciseId, documentId);
        List<InjectDocument> updatedInjects = exerciseInjects.stream().flatMap(inject -> {
            @SuppressWarnings("UnnecessaryLocalVariable")
            Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
                    .filter(document -> document.getDocument().getId().equals(documentId));
            return filterDocuments;
        }).toList();
        injectDocumentRepository.deleteAll(updatedInjects);
    }

    public void cleanInjectsDocScenario(String scenarioId, String documentId) {
        // Delete document from all scenario injects
        List<Inject> scenarioInjects = injectRepository.findAllForScenarioAndDoc(scenarioId, documentId);
        List<InjectDocument> updatedInjects = scenarioInjects.stream().flatMap(inject -> {
            @SuppressWarnings("UnnecessaryLocalVariable")
            Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
                    .filter(document -> document.getDocument().getId().equals(documentId));
            return filterDocuments;
        }).toList();
        injectDocumentRepository.deleteAll(updatedInjects);
    }

    @Transactional
    public List<Inject> findAllAtomicTestings() {
        return this.injectRepository.findAllAtomicTestings();
    }

    @Modifying
    @Transactional
    public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput status) {
        Inject inject = injectRepository.findById(injectId).orElseThrow();
        // build status
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(inject);
        injectStatus.setDate(now());
        injectStatus.setName(status.getStatus());
        injectStatus.setExecutionTime(0);
        Execution execution = new Execution(false);
        execution.addTrace(traceSuccess(currentUser().getId(), status.getMessage()));
        execution.stop();
        injectStatus.setReporting(execution);
        // Save status for inject
        inject.setStatus(injectStatus);
        return injectRepository.save(inject);
    }

    @Transactional
    public Optional<Inject> findById(String injectId) {
        return injectRepository.findWithStatusById(injectId);
    }
}
