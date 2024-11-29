package io.openbas.service;

import static io.openbas.utils.StringUtils.duplicateString;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectDocument;
import io.openbas.database.model.InjectStatus;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.rest.atomic_testing.form.InjectResultOverviewOutput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.utils.InjectMapper;
import io.openbas.utils.InjectUtils;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@RequiredArgsConstructor
@Service
@Log
public class InjectService {

  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final InjectStatusRepository injectStatusRepository;
  private final InjectMapper injectMapper;

  @Resource protected ObjectMapper mapper;

  public Inject inject(@NotBlank final String injectId) {
    return this.injectRepository
        .findById(injectId)
        .orElseThrow(() -> new ElementNotFoundException("Inject not found"));
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

  @Transactional(rollbackOn = Exception.class)
  public void deleteAllByIds(List<String> injectIds) {
    if (!CollectionUtils.isEmpty(injectIds)) {
      injectRepository.deleteAllById(injectIds);
    }
  }

  public void cleanInjectsDocExercise(String exerciseId, String documentId) {
    // Delete document from all exercise injects
    List<Inject> exerciseInjects =
        injectRepository.findAllForExerciseAndDoc(exerciseId, documentId);
    List<InjectDocument> updatedInjects =
        exerciseInjects.stream()
            .flatMap(
                inject -> {
                  @SuppressWarnings("UnnecessaryLocalVariable")
                  Stream<InjectDocument> filterDocuments =
                      inject.getDocuments().stream()
                          .filter(document -> document.getDocument().getId().equals(documentId));
                  return filterDocuments;
                })
            .toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  public void cleanInjectsDocScenario(String scenarioId, String documentId) {
    // Delete document from all scenario injects
    List<Inject> scenarioInjects =
        injectRepository.findAllForScenarioAndDoc(scenarioId, documentId);
    List<InjectDocument> updatedInjects =
        scenarioInjects.stream()
            .flatMap(
                inject -> {
                  @SuppressWarnings("UnnecessaryLocalVariable")
                  Stream<InjectDocument> filterDocuments =
                      inject.getDocuments().stream()
                          .filter(document -> document.getDocument().getId().equals(documentId));
                  return filterDocuments;
                })
            .toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  @Transactional
  public InjectResultOverviewOutput duplicate(String id) {
    Inject duplicatedInject = findAndDuplicateInject(id);
    duplicatedInject.setTitle(duplicateString(duplicatedInject.getTitle()));
    Inject savedInject = injectRepository.save(duplicatedInject);
    return injectMapper.toInjectResultOverviewOutput(savedInject);
  }

  @Transactional
  public InjectResultOverviewOutput launch(String id) {
    Inject inject = injectRepository.findById(id).orElseThrow(ElementNotFoundException::new);
    inject.clean();
    inject.setUpdatedAt(Instant.now());
    Inject savedInject = saveInjectAndStatusAsQueuing(inject);
    return injectMapper.toInjectResultOverviewOutput(savedInject);
  }

  @Transactional
  public InjectResultOverviewOutput relaunch(String id) {
    Inject duplicatedInject = findAndDuplicateInject(id);
    Inject savedInject = saveInjectAndStatusAsQueuing(duplicatedInject);
    delete(id);
    return injectMapper.toInjectResultOverviewOutput(savedInject);
  }

  @Transactional
  public void delete(String id) {
    injectDocumentRepository.deleteDocumentsFromInject(id);
    injectRepository.deleteById(id);
  }

  private Inject findAndDuplicateInject(String id) {
    Inject injectOrigin = injectRepository.findById(id).orElseThrow(ElementNotFoundException::new);
    return InjectUtils.duplicateInject(injectOrigin);
  }

  private Inject saveInjectAndStatusAsQueuing(Inject inject) {
    Inject savedInject = injectRepository.save(inject);
    InjectStatus injectStatus = saveInjectStatusAsQueuing(savedInject);
    savedInject.setStatus(injectStatus);
    return savedInject;
  }

  private InjectStatus saveInjectStatusAsQueuing(Inject inject) {
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setName(ExecutionStatus.QUEUING);
    this.injectStatusRepository.save(injectStatus);
    return injectStatus;
  }
}
