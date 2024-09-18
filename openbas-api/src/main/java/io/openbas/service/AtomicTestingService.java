package io.openbas.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.raw.RawAsset;
import io.openbas.database.raw.RawAssetGroup;
import io.openbas.database.raw.RawInjectExpectation;
import io.openbas.database.raw.RawTeam;
import io.openbas.database.repository.*;
import io.openbas.injector_contract.ContractType;
import io.openbas.rest.atomic_testing.form.AtomicTestingInput;
import io.openbas.rest.atomic_testing.form.AtomicTestingUpdateTagsInput;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.inject.output.AtomicTestingOutput;
import io.openbas.utils.AtomicTestingMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.hibernate.Hibernate;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.Instant;
import java.util.*;
import java.util.stream.StreamSupport;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.database.model.Command.COMMAND_TYPE;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.AtomicTestingUtils.*;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.JpaUtils.createLeftJoin;
import static io.openbas.utils.StringUtils.duplicateString;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;

@Service
@Log
@RequiredArgsConstructor
public class AtomicTestingService {

    @Resource
    protected ObjectMapper mapper;

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
    private ApplicationContext context;

    private static final String PRE_DEFINE_EXPECTATIONS = "predefinedExpectations";
    private static final String EXPECTATIONS = "expectations";

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public void setContext(ApplicationContext context) {
        this.context = context;
    }

    public InjectResultDTO findById(String injectId) {
        Optional<Inject> inject = injectRepository.findWithStatusById(injectId);
        InjectResultDTO result = inject
                .map(AtomicTestingMapper::toDtoWithTargetResults)
                .orElseThrow(ElementNotFoundException::new);
        result.setCommandsLines(getCommandsLinesFromInject(inject.get()));
        return result;
    }

    @Transactional
    public InjectResultDTO createOrUpdate(AtomicTestingInput input, String injectId) {
        Inject injectToSave = new Inject();
        if (injectId != null) {
            injectToSave = injectRepository.findById(injectId).orElseThrow();
        }

        InjectorContract injectorContract =
                injectorContractRepository.findById(input.getInjectorContract()).orElseThrow(ElementNotFoundException::new);
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
        injectToSave.setDependsOn(null);
        injectToSave.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
        injectToSave.setTags(iterableToSet(tagRepository.findAllById(input.getTagIds())));
        injectToSave.setAssets(fromIterable(this.assetRepository.findAllById(input.getAssets())));
        injectToSave.setAssetGroups(fromIterable(this.assetGroupRepository.findAllById(input.getAssetGroups())));

        List<String> previousDocumentIds = injectToSave
                .getDocuments()
                .stream()
                .map(InjectDocument::getDocument)
                .map(Document::getId)
                .toList();

        Inject finalInjectToSave = injectToSave;
        List<InjectDocument> injectDocuments = input.getDocuments().stream()
                .map(i -> {
                    if (!previousDocumentIds.contains(i.getDocumentId())) {
                        InjectDocument injectDocument = new InjectDocument();
                        injectDocument.setInject(finalInjectToSave);
                        injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow());
                        injectDocument.setAttached(i.isAttached());
                        return injectDocument;
                    }
                    return null;
                }).filter(Objects::nonNull).toList();
        injectToSave.getDocuments().addAll(injectDocuments);
        Inject inject = injectRepository.save(injectToSave);
        return AtomicTestingMapper.toDto(
                inject, getTargets(
                        inject.getTeams(),
                        inject.getAssets(),
                        inject.getAssetGroups()
                )
        );
    }

    private ObjectNode setExpectations(AtomicTestingInput input, InjectorContract injectorContract, ObjectNode finalContent) {
        if (input.getContent() == null || input.getContent().get(EXPECTATIONS) == null
                || input.getContent().get(EXPECTATIONS).isEmpty()) {
            try {
                JsonNode jsonNode = mapper.readTree(injectorContract.getContent());
                List<JsonNode> contractElements =
                        StreamSupport.stream(jsonNode.get("fields").spliterator(), false)
                                .filter(contractElement -> contractElement.get("type").asText()
                                        .equals(ContractType.Expectation.name().toLowerCase())).toList();
                if (!contractElements.isEmpty()) {
                    JsonNode contractElement = contractElements.getFirst();
                    if (!contractElement.get(PRE_DEFINE_EXPECTATIONS).isNull() && !contractElement.get(PRE_DEFINE_EXPECTATIONS).isEmpty()) {
                        finalContent = finalContent != null ? finalContent : mapper.createObjectNode();
                        ArrayNode predefinedExpectations = mapper.createArrayNode();
                        StreamSupport.stream(contractElement.get(PRE_DEFINE_EXPECTATIONS).spliterator(), false).forEach(predefinedExpectation -> {
                            ObjectNode newExpectation = predefinedExpectation.deepCopy();
                            newExpectation.put("expectation_score", 100);
                            predefinedExpectations.add(newExpectation);
                        });
                        // We need the remove in case there are empty expectations because put is deprecated and putifabsent doesn't replace empty expectations
                        if(finalContent.has(EXPECTATIONS) && finalContent.get(EXPECTATIONS).isEmpty()) {
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
    @Validated
    public InjectResultDTO getDuplicateAtomicTesting(@NotBlank String id) {
        Inject injectOrigin = injectRepository.findById(id).orElseThrow(ElementNotFoundException::new);
        Inject injectDuplicate = copyInject(injectOrigin, true);
        injectDuplicate.setExercise(injectOrigin.getExercise());
        injectDuplicate.setScenario(injectOrigin.getScenario());
        Inject inject = injectRepository.save(injectDuplicate);
        return AtomicTestingMapper.toDto(
                inject, getTargets(
                        inject.getTeams(),
                        inject.getAssets(),
                        inject.getAssetGroups()
                )
        );
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
            ObjectNode content = objectMapper
                    .readValue(objectMapper.writeValueAsString(injectOrigin.getContent()), ObjectNode.class);
            injectDuplicate.setContent(content);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        injectDuplicate.setAllTeams(injectOrigin.isAllTeams());
        injectDuplicate.setTeams(injectOrigin.getTeams().stream().toList());
        injectDuplicate.setEnabled(injectOrigin.isEnabled());
        injectDuplicate.setDependsDuration(injectOrigin.getDependsDuration());
        injectDuplicate.setDependsOn(injectOrigin.getDependsOn());
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

    public InjectResultDTO updateAtomicTestingTags(String injectId, AtomicTestingUpdateTagsInput input) {

        Inject inject = injectRepository.findById(injectId).orElseThrow();
        inject.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));

        Inject saved = injectRepository.save(inject);
        return AtomicTestingMapper.toDto(
                saved, getTargets(
                        saved.getTeams(),
                        saved.getAssets(),
                        saved.getAssetGroups()
                )
        );
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

    @Transactional
    public void deleteAtomicTesting(String injectId) {
        injectDocumentRepository.deleteDocumentsFromInject(injectId);
        injectRepository.deleteById(injectId);
    }

    // -- PAGINATION --

    public Page<AtomicTestingOutput> findAllAtomicTestings(@NotNull final SearchPaginationInput searchPaginationInput) {
        Specification<Inject> customSpec = Specification.where((root, query, cb) -> {
            Predicate predicate = cb.conjunction();
            predicate = cb.and(predicate, cb.isNull(root.get("scenario")));
            predicate = cb.and(predicate, cb.isNull(root.get("exercise")));
            return predicate;
        });
        return buildPaginationCriteriaBuilder(
                (Specification<Inject> specification, Pageable pageable) -> this.atomicTestings(
                    customSpec.and(specification), pageable),
                searchPaginationInput,
                Inject.class
        );
    }


    public Page<AtomicTestingOutput> atomicTestings(Specification<Inject> specification, Pageable pageable) {
        CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

        CriteriaQuery<Tuple> cq = cb.createTupleQuery();
        Root<Inject> injectRoot = cq.from(Inject.class);
        selectForAtomicTesting(cb, cq, injectRoot);

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

        Map<String, List<String>> teamIds = new HashMap<>();
        Map<String, List<String>> assetIds = new HashMap<>();
        Map<String, List<String>> assetGroupIds = new HashMap<>();
        Map<String, List<String>> injectExpectationIds = new HashMap<>();
        for (AtomicTestingOutput inject : injects) {
            teamIds.putIfAbsent(inject.getId(), inject.getTeams());
            assetIds.putIfAbsent(inject.getId(), inject.getAssets());
            assetGroupIds.putIfAbsent(inject.getId(), inject.getAssetGroups());
            injectExpectationIds.putIfAbsent(inject.getId(), inject.getExpectations());
        }

        List<RawTeam> teams = this.teamRepository.rawTeamByIds(
                teamIds.values().stream().flatMap(Collection::stream).distinct().toList()
        );
        List<RawAsset> assets = this.assetRepository.rawByIds(
                assetIds.values().stream().flatMap(Collection::stream).distinct().toList()
        );
        List<RawAssetGroup> assetGroups = this.assetGroupRepository.rawAssetGroupByIds(
                assetGroupIds.values().stream().flatMap(Collection::stream).distinct().toList()
        );
        List<RawInjectExpectation> expectations = this.injectExpectationRepository.rawByIds(
                injectExpectationIds.values().stream().flatMap(Collection::stream).distinct().toList());

        for (AtomicTestingOutput inject : injects) {
            List<String> currentTeamIds = teamIds.get(inject.getId());
            List<String> currentAssetIds = assetIds.get(inject.getId());
            List<String> currentAssetGroupIds = assetGroupIds.get(inject.getId());
            List<String> currentInjectExpectationIds = injectExpectationIds.get(inject.getId());
            inject.setTargets(getTargetsFromRaw(
                    teams.stream().filter(t -> currentTeamIds.contains(t.getTeam_id())).toList(),
                    assets.stream().filter(a -> currentAssetIds.contains(a.getAsset_id())).toList(),
                    assetGroups.stream().filter(ag -> currentAssetGroupIds.contains(ag.getAsset_group_id())).toList()
            ));
            inject.setExpectationResultByTypes(
                    getRawExpectationResultByTypes(
                            expectations.stream().filter(e -> currentInjectExpectationIds.contains(e.getInject_expectation_id()))
                                    .toList()
                    )
            );
        }

    // -- Count Query --
    Long total = countQuery(cb, this.entityManager, Inject.class, specification);

        return new PageImpl<>(injects, pageable, total);
    }

    private void selectForAtomicTesting(CriteriaBuilder cb, CriteriaQuery<Tuple> cq, Root<Inject> injectRoot) {
        // Joins
        Join<Inject, InjectorContract> injectorContractJoin = createLeftJoin(injectRoot, "injectorContract");
        Join<InjectorContract, Injector> injectorJoin = injectorContractJoin.join("injector", JoinType.LEFT);
        Join<Inject, InjectStatus> injectStatusJoin = createLeftJoin(injectRoot, "status");
        // Array aggregations
        Expression<String[]> injectExpectationIdsExpression = createJoinArrayAggOnId(cb, injectRoot, EXPECTATIONS);
        Expression<String[]> teamIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "teams");
        Expression<String[]> assetIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "assets");
        Expression<String[]> assetGroupIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "assetGroups");

        // SELECT
        cq.multiselect(
                injectRoot.get("id").alias("inject_id"),
                injectRoot.get("title").alias("inject_title"),
                injectRoot.get("updatedAt").alias("inject_updated_at"),
                injectorJoin.get("type").alias("inject_type"),
                injectorContractJoin.alias("inject_injector_contract"),
                injectStatusJoin.alias("inject_status"),
                injectExpectationIdsExpression.alias("inject_expectations"),
                teamIdsExpression.alias("inject_teams"),
                assetIdsExpression.alias("inject_assets"),
                assetGroupIdsExpression.alias("inject_asset_groups")
        ).distinct(true);

        // GROUP BY
        cq.groupBy(Arrays.asList(
                injectRoot.get("id"),
                injectorContractJoin.get("id"),
                injectorJoin.get("id"),
                injectStatusJoin.get("id")
        ));
    }

    private List<AtomicTestingOutput> execAtomicTesting(TypedQuery<Tuple> query) {
        return query.getResultList()
                .stream()
                .map(tuple -> new AtomicTestingOutput(
                        tuple.get("inject_id", String.class),
                        tuple.get("inject_title", String.class),
                        tuple.get("inject_updated_at", Instant.class),
                        tuple.get("inject_type", String.class),
                        tuple.get("inject_injector_contract", InjectorContract.class),
                        tuple.get("inject_status", InjectStatus.class),
                        tuple.get("inject_expectations", String[].class),
                        tuple.get("inject_teams", String[].class),
                        tuple.get("inject_assets", String[].class),
                        tuple.get("inject_asset_groups", String[].class)
                ))
                .toList();
    }

    public InjectStatusCommandLine getCommandsLinesFromInject(final Inject inject) {
        if (inject.getStatus().isPresent() && inject.getStatus().get().getCommandsLines() != null) {
            // Commands lines saved because inject has been executed
            return inject.getStatus().get().getCommandsLines();
        } else if (inject.getInjectorContract().isPresent()) {
            InjectorContract injectorContract = inject.getInjectorContract().get();
            if(injectorContract.getPayload() != null && COMMAND_TYPE.equals(injectorContract.getPayload().getType())) {
                // Inject has a command payload
                Payload payload = injectorContract.getPayload();
                Command payloadCommand = (Command) Hibernate.unproxy(payload);
                return new InjectStatusCommandLine(!payloadCommand.getContent().isBlank() ? List.of(payloadCommand.getContent()) : null,
                        !payloadCommand.getCleanupCommand().isBlank() ? List.of(payload.getCleanupCommand()) : null, payload.getExternalId());
            } else {
                // Inject comes from Caldera ability and tomorrow from other(s) Executor(s)
                io.openbas.execution.Injector executor = context.getBean(injectorContract.getInjector().getType(), io.openbas.execution.Injector.class);
                return executor.getCommandsLines(injectorContract.getId());
            }
        }
        return null;
    }

}
