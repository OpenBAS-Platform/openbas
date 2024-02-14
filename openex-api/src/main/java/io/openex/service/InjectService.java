package io.openex.service;

import io.openex.database.model.Inject;
import io.openex.database.model.InjectDocument;
import io.openex.database.repository.InjectDocumentRepository;
import io.openex.database.repository.InjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

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
}
