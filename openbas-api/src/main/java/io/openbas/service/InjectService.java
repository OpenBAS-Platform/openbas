package io.openbas.service;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class InjectService {

  private final InjectRepository injectRepository;
  private final InjectorContractRepository injectorContractRepository;
  private final InjectDocumentRepository injectDocumentRepository;

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

  @Transactional(rollbackOn = Exception.class)
  public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setTrackingSentDate(now());
    injectStatus.setName(ExecutionStatus.valueOf(input.getStatus()));
    injectStatus.setTrackingTotalExecutionTime(0L);
    // Save status for inject
    inject.setStatus(injectStatus);
    return injectRepository.save(inject);
  }

}
