package io.openbas.rest.inject.service;

import static io.openbas.utils.StringUtils.duplicateString;
import static java.time.Instant.now;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
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
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
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

  public <T> T convertInjectContent(@NotNull final Inject inject, @NotNull final Class<T> converter)
      throws Exception {
    ObjectNode content = inject.getContent();
    return this.mapper.treeToValue(content, converter);
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

  /**
   * Update an inject with default asset groups
   *
   * @param injectId
   * @param defaultAssetGroupsToAdd
   * @param defaultAssetGroupsToRemove
   * @return
   */
  @Transactional
  public Inject applyDefaultAssetGroupsToInject(
      final String injectId,
      final List<AssetGroup> defaultAssetGroupsToAdd,
      final List<AssetGroup> defaultAssetGroupsToRemove) {

    // fetch the inject
    Inject inject =
        this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);

    // remove/add default asset groups and remove duplicates
    List<AssetGroup> currentAssetGroups = inject.getAssetGroups();
    // Get the Id of the asset groups to remove and filter the assets that are in both lists
    List<String> assetGroupIdsToRemove =
        defaultAssetGroupsToRemove.stream()
            .filter(asset -> !defaultAssetGroupsToAdd.contains(asset))
            .map(AssetGroup::getId)
            .toList();
    Set<String> uniqueAssetsIds = new HashSet<>();
    List<AssetGroup> newListOfAssetGroups =
        Stream.concat(currentAssetGroups.stream(), defaultAssetGroupsToAdd.stream())
            .filter(assetGroup -> !assetGroupIdsToRemove.contains(assetGroup.getId()))
            .filter(assetGroup -> uniqueAssetsIds.add(assetGroup.getId()))
            .collect(Collectors.toList());

    if (new HashSet<>(currentAssetGroups).equals(new HashSet<>(newListOfAssetGroups))) {
      return inject;
    } else {
      inject.setAssetGroups(newListOfAssetGroups);
      return this.injectRepository.save(inject);
    }
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
