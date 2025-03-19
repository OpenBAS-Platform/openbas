package io.openbas.service;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.injector_contract.fields.ContractFieldType;
import io.openbas.rest.atomic_testing.form.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.telemetry.metric_collectors.ActionMetricCollector;
import io.openbas.utils.InjectMapper;
import io.openbas.utils.PayloadMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import java.util.*;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@Log
@RequiredArgsConstructor
public class AtomicTestingService {

  @Resource protected ObjectMapper mapper;
  private final InjectMapper injectMapper;
  private final ActionMetricCollector actionMetricCollector;

  private final AssetGroupRepository assetGroupRepository;
  private final AssetRepository assetRepository;
  private final PayloadMapper payloadMapper;
  private final InjectRepository injectRepository;
  private final InjectorContractRepository injectorContractRepository;
  private final UserRepository userRepository;
  private final TeamRepository teamRepository;
  private final TagRepository tagRepository;
  private final DocumentRepository documentRepository;
  private final AssetGroupService assetGroupService;

  private final InjectSearchService injectSearchService;
  private final InjectService injectService;

  private static final String PRE_DEFINE_EXPECTATIONS = "predefinedExpectations";
  private static final String EXPECTATIONS = "expectations";

  // -- CRUD --

  public InjectResultOverviewOutput findById(String injectId) {
    Optional<Inject> inject = injectRepository.findWithStatusById(injectId);

    if (inject.isPresent()) {
      List<AssetGroup> computedAssetGroup =
          inject.get().getAssetGroups().stream()
              .map(assetGroupService::computeDynamicAssets)
              .toList();
      inject.get().getAssetGroups().clear();
      inject.get().getAssetGroups().addAll(computedAssetGroup);
    }
    return inject
        .map(injectMapper::toInjectResultOverviewOutput)
        .orElseThrow(ElementNotFoundException::new);
  }

  public StatusPayloadOutput findPayloadOutputByInjectId(String injectId) {
    Optional<Inject> inject = injectRepository.findById(injectId);
    return payloadMapper.getStatusPayloadOutputFromInject(inject);
  }

  @Transactional
  public InjectResultOverviewOutput createOrUpdate(AtomicTestingInput input, String injectId) {
    Inject injectToSave = new Inject();
    if (injectId != null) {
      injectToSave = injectRepository.findById(injectId).orElseThrow();
    }

    InjectorContract injectorContract =
        injectorContractRepository
            .findById(input.getInjectorContract())
            .orElseThrow(ElementNotFoundException::new);
    ObjectNode finalContent = input.getContent();
    // Set expectations
    if (injectId == null) {
      finalContent = setExpectations(input, injectorContract, finalContent);
    }
    injectToSave.setTitle(input.getTitle());
    injectToSave.setContent(finalContent);
    injectToSave.setInjectorContract(injectorContract);
    injectToSave.setAllTeams(input.isAllTeams());
    injectToSave.setDescription(input.getDescription());
    injectToSave.setDependsDuration(0L);
    injectToSave.setUser(
        userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new ElementNotFoundException("Current user not found")));
    injectToSave.setExercise(null);

    // Set dependencies
    injectToSave.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
    injectToSave.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
    injectToSave.setAssets(fromIterable(this.assetRepository.findAllById(input.getAssets())));
    injectToSave.setAssetGroups(
        fromIterable(this.assetGroupRepository.findAllById(input.getAssetGroups())));

    List<String> previousDocumentIds =
        injectToSave.getDocuments().stream()
            .map(InjectDocument::getDocument)
            .map(Document::getId)
            .toList();

    Inject finalInjectToSave = injectToSave;
    List<InjectDocument> injectDocuments =
        input.getDocuments().stream()
            .map(
                i -> {
                  if (!previousDocumentIds.contains(i.getDocumentId())) {
                    InjectDocument injectDocument = new InjectDocument();
                    injectDocument.setInject(finalInjectToSave);
                    injectDocument.setDocument(
                        documentRepository.findById(i.getDocumentId()).orElseThrow());
                    injectDocument.setAttached(i.isAttached());
                    return injectDocument;
                  }
                  return null;
                })
            .filter(Objects::nonNull)
            .toList();
    injectToSave.getDocuments().addAll(injectDocuments);
    if (injectId == null) {
      actionMetricCollector.addAtomicTestingCreatedCount();
    }
    Inject inject = injectRepository.save(injectToSave);
    return injectMapper.toInjectResultOverviewOutput(inject);
  }

  private ObjectNode setExpectations(
      AtomicTestingInput input, InjectorContract injectorContract, ObjectNode finalContent) {
    if (input.getContent() == null
        || input.getContent().get(EXPECTATIONS) == null
        || input.getContent().get(EXPECTATIONS).isEmpty()) {
      try {
        JsonNode jsonNode = mapper.readTree(injectorContract.getContent());
        List<JsonNode> contractElements =
            StreamSupport.stream(jsonNode.get("fields").spliterator(), false)
                .filter(
                    contractElement ->
                        contractElement
                            .get("type")
                            .asText()
                            .equals(ContractFieldType.Expectation.name().toLowerCase()))
                .toList();
        if (!contractElements.isEmpty()) {
          JsonNode contractElement = contractElements.getFirst();
          if (!contractElement.get(PRE_DEFINE_EXPECTATIONS).isNull()
              && !contractElement.get(PRE_DEFINE_EXPECTATIONS).isEmpty()) {
            finalContent = finalContent != null ? finalContent : mapper.createObjectNode();
            ArrayNode predefinedExpectations = mapper.createArrayNode();
            StreamSupport.stream(contractElement.get(PRE_DEFINE_EXPECTATIONS).spliterator(), false)
                .forEach(
                    predefinedExpectation -> {
                      ObjectNode newExpectation = predefinedExpectation.deepCopy();
                      newExpectation.put("expectation_score", 100);
                      predefinedExpectations.add(newExpectation);
                    });
            // We need the remove in case there are empty expectations because put is deprecated and
            // putifabsent doesn't replace empty expectations
            if (finalContent.has(EXPECTATIONS) && finalContent.get(EXPECTATIONS).isEmpty()) {
              finalContent.remove(EXPECTATIONS);
            }
            finalContent.putIfAbsent(EXPECTATIONS, predefinedExpectations);
          }
        }
      } catch (JsonProcessingException e) {
        log.severe("Cannot open injector contract");
      }
    }
    return finalContent;
  }

  @Transactional
  public InjectResultOverviewOutput updateAtomicTestingTags(
      String injectId, AtomicTestingUpdateTagsInput input) {

    Inject inject = injectRepository.findById(injectId).orElseThrow();
    inject.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));

    Inject saved = injectRepository.save(inject);
    return injectMapper.toInjectResultOverviewOutput(saved);
  }

  public void deleteAtomicTesting(String injectId) {
    injectService.delete(injectId);
  }

  // -- ACTIONS --

  public InjectResultOverviewOutput duplicate(String id) {
    this.actionMetricCollector.addAtomicTestingCreatedCount();
    return injectService.duplicate(id);
  }

  public InjectResultOverviewOutput launch(String id) {
    return injectService.launch(id);
  }

  public InjectResultOverviewOutput relaunch(String id) {
    return injectService.relaunch(id);
  }

  // -- PAGINATION --

  public Page<InjectResultOutput> searchAtomicTestings(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    Map<String, Join<Base, Base>> joinMap = new HashMap<>();

    Specification<Inject> customSpec =
        Specification.where(
            (root, query, cb) -> {
              Predicate predicate = cb.conjunction();
              predicate = cb.and(predicate, cb.isNull(root.get("scenario")));
              predicate = cb.and(predicate, cb.isNull(root.get("exercise")));
              return predicate;
            });
    return buildPaginationCriteriaBuilder(
        (Specification<Inject> specification,
            Specification<Inject> specificationCount,
            Pageable pageable) ->
            injectSearchService.injectResults(
                customSpec.and(specification),
                customSpec.and(specificationCount),
                pageable,
                joinMap),
        searchPaginationInput,
        Inject.class,
        joinMap);
  }
}
