package io.openbas.service;

import static io.openbas.aop.LoggingAspect.logger;
import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.AtomicTestingUtils.*;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.StringUtils.duplicateString;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.*;
import io.openbas.database.raw.*;
import io.openbas.database.repository.*;
import io.openbas.injector_contract.ContractType;
import io.openbas.rest.atomic_testing.form.*;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.utils.InjectMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.*;
import java.util.stream.StreamSupport;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Log
@RequiredArgsConstructor
public class AtomicTestingService {

  @Resource protected ObjectMapper mapper;

  private final AssetGroupRepository assetGroupRepository;
  private final AssetRepository assetRepository;
  private final InjectRepository injectRepository;
  private final InjectExpectationRepository injectExpectationRepository;
  private final InjectStatusRepository injectStatusRepository;
  private final InjectorContractRepository injectorContractRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final UserRepository userRepository;
  private final TeamRepository teamRepository;
  private final TagRepository tagRepository;
  private final DocumentRepository documentRepository;
  private final AssetGroupService assetGroupService;
  private final InjectMapper injectMapper;

  private static final String PRE_DEFINE_EXPECTATIONS = "predefinedExpectations";
  private static final String EXPECTATIONS = "expectations";

  @PersistenceContext private EntityManager entityManager;

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
    InjectResultOverviewOutput result =
        inject.map(injectMapper::toDto).orElseThrow(ElementNotFoundException::new);
    return result;
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
    injectToSave.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
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
    Inject inject = injectRepository.save(injectToSave);
    return injectMapper.toDto(inject);
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
                            .equals(ContractType.Expectation.name().toLowerCase()))
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
    return injectMapper.toDto(saved);
  }

  @Transactional
  public void deleteAtomicTesting(String injectId) {
    injectDocumentRepository.deleteDocumentsFromInject(injectId);
    injectRepository.deleteById(injectId);
  }

  // -- ACTIONS --

  @Transactional
  @Validated
  public InjectResultOverviewOutput getDuplicateAtomicTesting(@NotBlank String id) {
    Inject injectOrigin = injectRepository.findById(id).orElseThrow(ElementNotFoundException::new);
    Inject injectDuplicate = copyInject(injectOrigin, true);
    injectDuplicate.setExercise(injectOrigin.getExercise());
    injectDuplicate.setScenario(injectOrigin.getScenario());
    Inject inject = injectRepository.save(injectDuplicate);
    return injectMapper.toDto(inject);
  }

  public Inject copyInject(@NotNull Inject injectOrigin, boolean isAtomic) {
    ObjectMapper objectMapper = new ObjectMapper();
    Inject injectDuplicate = new Inject();
    injectDuplicate.setUser(injectOrigin.getUser());
    if (isAtomic) {
      injectDuplicate.setTitle(duplicateString(injectOrigin.getTitle()));
    } else {
      injectDuplicate.setTitle(injectOrigin.getTitle());
    }
    injectDuplicate.setDescription(injectOrigin.getDescription());
    try {
      ObjectNode content =
          objectMapper.readValue(
              objectMapper.writeValueAsString(injectOrigin.getContent()), ObjectNode.class);
      injectDuplicate.setContent(content);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
    injectDuplicate.setAllTeams(injectOrigin.isAllTeams());
    injectDuplicate.setTeams(injectOrigin.getTeams().stream().toList());
    injectDuplicate.setEnabled(injectOrigin.isEnabled());
    injectDuplicate.setDependsDuration(injectOrigin.getDependsDuration());
    if (injectOrigin.getDependsOn() != null) {
      injectDuplicate.setDependsOn(injectOrigin.getDependsOn().stream().toList());
    }
    injectDuplicate.setCountry(injectOrigin.getCountry());
    injectDuplicate.setCity(injectOrigin.getCity());
    injectDuplicate.setInjectorContract(injectOrigin.getInjectorContract().orElse(null));
    injectDuplicate.setAssetGroups(injectOrigin.getAssetGroups().stream().toList());
    injectDuplicate.setAssets(injectOrigin.getAssets().stream().toList());
    injectDuplicate.setCommunications(injectOrigin.getCommunications().stream().toList());
    injectDuplicate.setPayloads(injectOrigin.getPayloads().stream().toList());
    injectDuplicate.setTags(new HashSet<>(injectOrigin.getTags()));
    return injectDuplicate;
  }

  @Transactional
  public Inject tryInject(String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();

    // Reset injects outcome, communications and expectations
    inject.clean();
    inject.setUpdatedAt(Instant.now());

    // New inject status
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setTrackingSentDate(Instant.now());
    injectStatus.setName(ExecutionStatus.QUEUING);
    this.injectStatusRepository.save(injectStatus);

    // Return inject
    return this.injectRepository.save(inject);
  }

  // -- PAGINATION --

  public Page<AtomicTestingOutput> findAllAtomicTestings(
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
            this.atomicTestings(
                customSpec.and(specification),
                customSpec.and(specificationCount),
                pageable,
                joinMap),
        searchPaginationInput,
        Inject.class,
        joinMap);
  }

  public Page<AtomicTestingOutput> atomicTestings(
      Specification<Inject> specification,
      Specification<Inject> specificationCount,
      Pageable pageable,
      Map<String, Join<Base, Base>> joinMap) {
    CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<Inject> injectRoot = cq.from(Inject.class);
    selectForAtomicTesting(cb, cq, injectRoot, joinMap);

    // -- Text Search and Filters --
    if (specification != null) {
      Predicate predicate = specification.toPredicate(injectRoot, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    // -- Sorting --
    List<Order> orders = toSortCriteriaBuilder(cb, injectRoot, pageable.getSort());
    cq.orderBy(orders);

    // Type Query
    TypedQuery<Tuple> query = entityManager.createQuery(cq);

    // -- Pagination --
    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());

    // -- EXECUTION --
    List<AtomicTestingOutput> injects = execAtomicTesting(query);

    // -- Count Query --
    Long total = countQuery(cb, this.entityManager, Inject.class, specificationCount);

    return new PageImpl<>(injects, pageable, total);
  }

  private void selectForAtomicTesting(
      CriteriaBuilder cb,
      CriteriaQuery<Tuple> cq,
      Root<Inject> injectRoot,
      Map<String, Join<Base, Base>> joinMap) {
    // Joins
    Join<Base, Base> injectorContractJoin = injectRoot.join("injectorContract", JoinType.LEFT);
    joinMap.put("injectorContract", injectorContractJoin);

    Join<Base, Base> injectorJoin = injectorContractJoin.join("injector", JoinType.LEFT);
    joinMap.put("injector", injectorJoin);

    Join<Base, Base> payloadJoin = injectorContractJoin.join("payload", JoinType.LEFT);
    joinMap.put("payload", injectorJoin);

    Join<Base, Base> collectorJoin = payloadJoin.join("collector", JoinType.LEFT);
    joinMap.put("collector", injectorJoin);

    Join<Inject, InjectStatus> statusJoin = injectRoot.join("status", JoinType.LEFT);

    // Array aggregations
    Expression<String[]> injectExpectationIdsExpression =
        createJoinArrayAggOnId(cb, injectRoot, EXPECTATIONS);
    Expression<String[]> teamIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "teams");
    Expression<String[]> assetIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "assets");
    Expression<String[]> assetGroupIdsExpression =
        createJoinArrayAggOnId(cb, injectRoot, "assetGroups");

    // SELECT
    cq.multiselect(
            injectRoot.get("id").alias("inject_id"),
            injectRoot.get("title").alias("inject_title"),
            injectRoot.get("updatedAt").alias("inject_updated_at"),
            injectorJoin.get("type").alias("inject_type"),
            injectorContractJoin.get("id").alias("injector_contract_id"),
            injectorContractJoin.get("content").alias("injector_contract_content"),
            injectorContractJoin.get("convertedContent").alias("convertedContent"),
            injectorContractJoin.get("platforms").alias("injector_contract_platforms"),
            injectorContractJoin.get("labels").alias("injector_contract_labels"),
            payloadJoin.get("id").alias("payload_id"),
            payloadJoin.get("type").alias("payload_type"),
            collectorJoin.get("type").alias("payload_collector_type"),
            statusJoin.get("name").alias("status_name"),
            statusJoin.get("trackingSentDate").alias("status_tracking_sent_date"),
            injectExpectationIdsExpression.alias("inject_expectations"),
            teamIdsExpression.alias("inject_teams"),
            assetIdsExpression.alias("inject_assets"),
            assetGroupIdsExpression.alias("inject_asset_groups"))
        .distinct(true);

    // GROUP BY
    cq.groupBy(
        Arrays.asList(
            injectRoot.get("id"),
            injectorContractJoin.get("id"),
            injectorJoin.get("id"),
            payloadJoin.get("id"),
            collectorJoin.get("id"),
            statusJoin.get("id")));
  }

  private List<AtomicTestingOutput> execAtomicTesting(TypedQuery<Tuple> query) {
    long start = System.currentTimeMillis();
    List<Tuple> resultList = query.getResultList();
    long executionTime = System.currentTimeMillis() - start;
    logger.info("execut query  : " + executionTime + " ms");
    return resultList.stream()
        .map(
            tuple -> {
              InjectStatusSimple injectStatus = null;
              ExecutionStatus status = tuple.get("status_name", ExecutionStatus.class);
              if (status != null) {
                injectStatus =
                    InjectStatusSimple.builder()
                        .name(status.name())
                        .trackingSentDate(tuple.get("status_tracking_sent_date", Instant.class))
                        .build();
              }

              InjectorContractSimple injectorContractSimple = null;
              String injectorContractId = tuple.get("injector_contract_id", String.class);
              if (injectorContractId != null) {
                injectorContractSimple =
                    InjectorContractSimple.builder()
                        .id(injectorContractId)
                        .content(tuple.get("injector_contract_content", String.class))
                        .convertedContent(tuple.get("convertedContent", ObjectNode.class))
                        .platforms(
                            tuple.get(
                                "injector_contract_platforms", Endpoint.PLATFORM_TYPE[].class))
                        .payloadId(tuple.get("injector_contract_payload_id", String.class))
                        .payloadType(tuple.get("injector_contract_payload_type", String.class))
                        .payloadCollectorType(tuple.get("injector_contract_payload_collector_type", String.class))
                        .labels(tuple.get("injector_contract_labels", Map.class))
                        .build();
              }

              //              Map<String, List<String>> teamIds = new HashMap<>();
              //              Map<String, List<String>> assetIds = new HashMap<>();
              //              Map<String, List<String>> assetGroupIds = new HashMap<>();
              //              Map<String, List<String>> injectExpectationIds = new HashMap<>();
              //              for (AtomicTestingOutput inject : injects) {
              //                teamIds.putIfAbsent(inject.getId(), inject.getTeams());
              //                assetIds.putIfAbsent(inject.getId(), inject.getAssets());
              //                assetGroupIds.putIfAbsent(inject.getId(), inject.getAssetGroups());
              //                injectExpectationIds.putIfAbsent(inject.getId(),
              // inject.getExpectations());
              //              }
              //
              //              List<RawTeam> teams =
              //                  this.teamRepository.rawTeamByIds(
              //
              // teamIds.values().stream().flatMap(Collection::stream).distinct().toList());
              //              List<RawAsset> assets =
              //                  this.assetRepository.rawByIds(
              //
              // assetIds.values().stream().flatMap(Collection::stream).distinct().toList());
              //              List<RawAssetGroup> assetGroups =
              //                  this.assetGroupRepository.rawAssetGroupByIds(
              //
              // assetGroupIds.values().stream().flatMap(Collection::stream).distinct().toList());
              //              List<RawInjectExpectation> expectations =
              //                  this.injectExpectationRepository.rawByIds(
              //
              // injectExpectationIds.values().stream().flatMap(Collection::stream).distinct().toList());
              //
              //              start = System.currentTimeMillis();
              //              for (AtomicTestingOutput inject : injects) {
              //                List<String> currentTeamIds = teamIds.get(inject.getId());
              //                List<String> currentAssetIds = assetIds.get(inject.getId());
              //                List<String> currentAssetGroupIds =
              // assetGroupIds.get(inject.getId());
              //                List<String> currentInjectExpectationIds =
              // injectExpectationIds.get(inject.getId());
              //                inject
              //                    .getTargets()
              //                    .addAll(
              //                        injectMapper.toTargetSimple(
              //                            teams.stream()
              //                                .filter(t ->
              // currentTeamIds.contains(t.getTeam_id()))
              //                                .map(team -> (RawTarget) team)
              //                                .toList()));
              //                inject
              //                    .getTargets()
              //                    .addAll(
              //                        injectMapper.toTargetSimple(
              //                            assets.stream()
              //                                .filter(a ->
              // currentAssetIds.contains(a.getAsset_id()))
              //                                .map(asset -> (RawTarget) asset)
              //                                .toList()));
              //                inject
              //                    .getTargets()
              //                    .addAll(
              //                        injectMapper.toTargetSimple(
              //                            assetGroups.stream()
              //                                .filter(ag ->
              // currentAssetGroupIds.contains(ag.getAsset_group_id()))
              //                                .map(assetGroup -> (RawTarget) assetGroup)
              //                                .toList()));
              //
              //                inject.setExpectationResultByTypes(
              //                    getExpectationResultByTypesFromRaw(
              //                        expectations.stream()
              //                            .filter(e ->
              // currentInjectExpectationIds.contains(e.getInject_expectation_id()))
              //                            .toList()));
              //              }

              return new AtomicTestingOutput(
                  tuple.get("inject_id", String.class),
                  tuple.get("inject_title", String.class),
                  tuple.get("inject_updated_at", Instant.class),
                  tuple.get("inject_type", String.class),
                  injectorContractSimple,
                  injectStatus);
            })
        .toList();
  }
}
