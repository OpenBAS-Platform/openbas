package io.openbas.rest.inject;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.asset.AssetGroupService;
import io.openbas.asset.AssetService;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Executor;
import io.openbas.inject_expectation.InjectExpectationService;
import io.openbas.injector_contract.ContractType;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.*;
import io.openbas.service.AtomicTestingService;
import io.openbas.service.InjectService;
import io.openbas.service.ScenarioService;
import io.openbas.utils.AtomicTestingMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.specification.CommunicationSpecification.fromInject;
import static io.openbas.helper.DatabaseHelper.resolveOptionalRelation;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.AtomicTestingUtils.getTargets;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;
import static java.time.Instant.now;

@Log
@RestController
public class InjectApi extends RestBehavior {

    private static final int MAX_NEXT_INJECTS = 6;

    private Executor executor;
    private InjectorContractRepository injectorContractRepository;
    private CommunicationRepository communicationRepository;
    private ExerciseRepository exerciseRepository;
    private UserRepository userRepository;
    private InjectRepository injectRepository;
    private InjectDocumentRepository injectDocumentRepository;
    private TeamRepository teamRepository;
    private AssetService assetService;
    private AssetGroupService assetGroupService;
    private TagRepository tagRepository;
    private DocumentRepository documentRepository;
    private ExecutionContextService executionContextService;
    private ScenarioService scenarioService;
    private InjectService injectService;
    private AtomicTestingService atomicTestingService;

    @Resource
    protected ObjectMapper mapper;

    @Autowired
    public void setExecutor(Executor executor) {
        this.executor = executor;
    }

    @Autowired
    public void setInjectorContractRepository(InjectorContractRepository injectorContractRepository) {
        this.injectorContractRepository = injectorContractRepository;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setCommunicationRepository(CommunicationRepository communicationRepository) {
        this.communicationRepository = communicationRepository;
    }

    @Autowired
    public void setInjectDocumentRepository(InjectDocumentRepository injectDocumentRepository) {
        this.injectDocumentRepository = injectDocumentRepository;
    }

    @Autowired
    public void setDocumentRepository(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Autowired
    public void setExerciseRepository(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Autowired
    public void setTeamRepository(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    @Autowired
    public void setAssetService(@NotNull final AssetService assetService) {
        this.assetService = assetService;
    }

    @Autowired
    public void setAssetGroupService(@NotNull final AssetGroupService assetGroupService) {
        this.assetGroupService = assetGroupService;
    }

    @Autowired
    public void setInjectRepository(InjectRepository injectRepository) {
        this.injectRepository = injectRepository;
    }

    @Autowired
    public void setScenarioService(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    @Autowired
    public void setInjectService(InjectService injectService) {
        this.injectService = injectService;
    }

    @Autowired
    public void setAtomicTestingService(AtomicTestingService atomicTestingService) {
        this.atomicTestingService = atomicTestingService;
    }

    @Autowired
    public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
        this.executionContextService = executionContextService;
    }

    // -- INJECTS --

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/injects/execution/reception/{injectId}")
    public Inject InjectExecutionReception(@PathVariable String injectId,
                                           @Valid @RequestBody InjectReceptionInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
        InjectStatus injectStatus = inject.getStatus().orElseThrow(ElementNotFoundException::new);
        injectStatus.setName(ExecutionStatus.PENDING);
        injectStatus.setTrackingAckDate(Instant.now());
        injectStatus.setTrackingTotalCount(input.getTrackingTotalCount());
        injectStatus.setTrackingTotalSuccess(0);
        injectStatus.setTrackingTotalError(0);
        return injectRepository.save(inject);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/injects/execution/callback/{injectId}")
    public Inject InjectExecutionCallback(@PathVariable String injectId, @Valid @RequestBody InjectExecutionInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
        InjectStatus injectStatus = inject.getStatus().orElseThrow(ElementNotFoundException::new);
        ExecutionStatus executionStatus = ExecutionStatus.valueOf(input.getStatus());
        InjectStatusExecution execution = new InjectStatusExecution();
        Instant trackingEndDate = now();
        execution.setTime(trackingEndDate);
        execution.setStatus(executionStatus);
        execution.setMessage(input.getMessage());
        execution.setIdentifiers(input.getIdentifiers());
        injectStatus.getTraces().add(execution);
        if (executionStatus.equals(ExecutionStatus.SUCCESS)) {
            injectStatus.setTrackingTotalSuccess(injectStatus.getTrackingTotalSuccess() + 1);
        } else {
            injectStatus.setTrackingTotalError(injectStatus.getTrackingTotalSuccess() + 1);
        }
        int currentTotal = injectStatus.getTrackingTotalError() + injectStatus.getTrackingTotalSuccess();
        if (injectStatus.getTrackingTotalCount() >= currentTotal) {
            injectStatus.setTrackingEndDate(trackingEndDate);
            injectStatus.setTrackingTotalExecutionTime(
                    Duration.between(injectStatus.getTrackingSentDate(), trackingEndDate).getSeconds());
            if (injectStatus.getTrackingTotalError().equals(injectStatus.getTrackingTotalCount())) {
                injectStatus.setName(ExecutionStatus.ERROR);
            } else if (injectStatus.getTrackingTotalError() > 0) {
                injectStatus.setName(ExecutionStatus.PARTIAL);
            } else {
                injectStatus.setName(ExecutionStatus.SUCCESS);
            }
        }
        return injectRepository.save(inject);
    }


    @GetMapping("/api/injects/try/{injectId}")
    public Inject tryInject(@PathVariable String injectId) {
        return atomicTestingService.tryInject(injectId);
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping("/api/injects/{exerciseId}/{injectId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject updateInject(
            @PathVariable String exerciseId,
            @PathVariable String injectId,
            @Valid @RequestBody InjectInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        Inject inject = updateInject(injectId, input);

        // If Documents not yet linked directly to the exercise, attached it
        inject.getDocuments().forEach(document -> {
            if (!document.getDocument().getExercises().contains(exercise)) {
                exercise.getDocuments().add(document.getDocument());
            }
        });
        this.exerciseRepository.save(exercise);
        return injectRepository.save(inject);
    }

    // -- EXERCISES --

    @GetMapping("/api/exercises/{exerciseId}/injects")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Inject> exerciseInjects(@PathVariable String exerciseId) {
        return injectRepository.findAll(InjectSpecification.fromExercise(exerciseId)).stream()
                .sorted(Inject.executionComparator).toList();
    }

    @PostMapping("/api/exercises/{exerciseId}/injects/search")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Page<InjectResultDTO> exerciseInjects(
            @PathVariable final String exerciseId,
            @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
        return buildPaginationJPA(
                (Specification<Inject> specification, Pageable pageable) -> this.injectRepository.findAll(
                        InjectSpecification.fromExercise(exerciseId).and(specification), pageable),
                searchPaginationInput,
                Inject.class
        ).map(inject -> AtomicTestingMapper.toDto(
                inject, getTargets(
                        inject.getTeams(),
                        inject.getAssets(),
                        inject.getAssetGroups()
                )
        ));
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Inject exerciseInject(@PathVariable String exerciseId, @PathVariable String injectId) {
        return injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}/teams")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Team> exerciseInjectTeams(@PathVariable String exerciseId, @PathVariable String injectId) {
        return injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new).getTeams();
    }

    @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}/communications")
    @PreAuthorize("isExerciseObserver(#exerciseId)")
    public Iterable<Communication> exerciseInjectCommunications(@PathVariable String exerciseId,
                                                                @PathVariable String injectId) {
        List<Communication> coms = communicationRepository.findAll(fromInject(injectId),
                Sort.by(Sort.Direction.DESC, "receivedAt"));
        List<Communication> ackComs = coms.stream().peek(com -> com.setAck(true)).toList();
        return communicationRepository.saveAll(ackComs);
    }

    @PostMapping("/api/exercises/{exerciseId}/injects")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject createInject(@PathVariable String exerciseId, @Valid @RequestBody InjectInput input) {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
        InjectorContract injectorContract = injectorContractRepository.findById(input.getInjectorContract()).orElseThrow(ElementNotFoundException::new);
        // Set expectations
        ObjectNode finalContent = input.getContent();
        if (input.getContent() == null || input.getContent().get("expectations") == null || input.getContent().get("expectations").isEmpty()) {
            try {
                JsonNode jsonNode = mapper.readTree(injectorContract.getContent());
                List<JsonNode> contractElements = StreamSupport.stream(jsonNode.get("fields").spliterator(), false).filter(contractElement -> contractElement.get("type").asText().equals(ContractType.Expectation.name().toLowerCase())).toList();
                if (!contractElements.isEmpty()) {
                    JsonNode contractElement = contractElements.getFirst();
                    if (!contractElement.get("predefinedExpectations").isNull() && !contractElement.get("predefinedExpectations").isEmpty()) {
                        finalContent = finalContent != null ? finalContent : mapper.createObjectNode();
                        ArrayNode predefinedExpectations = mapper.createArrayNode();
                        StreamSupport.stream(contractElement.get("predefinedExpectations").spliterator(), false).forEach(predefinedExpectation -> {
                            ObjectNode newExpectation = predefinedExpectation.deepCopy();
                            newExpectation.put("expectation_score", 100);
                            predefinedExpectations.add(newExpectation);
                        });
                        finalContent.put("expectations", predefinedExpectations);
                    }
                }
            } catch (JsonProcessingException e) {
                log.severe("Cannot open injector contract");
            }
        }
        input.setContent(finalContent);
        // Get common attributes
        Inject inject = input.toInject(injectorContract);
        inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow(ElementNotFoundException::new));
        inject.setExercise(exercise);
        // Set dependencies
        inject.setDependsOn(resolveOptionalRelation(input.getDependsOn(), injectRepository));
        inject.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
        inject.setAssets(fromIterable(assetService.assets(input.getAssets())));
        inject.setAssetGroups(fromIterable(assetGroupService.assetGroups(input.getAssetGroups())));
        inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        List<InjectDocument> injectDocuments = input.getDocuments().stream()
                .map(i -> {
                    InjectDocument injectDocument = new InjectDocument();
                    injectDocument.setInject(inject);
                    injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow(ElementNotFoundException::new));
                    injectDocument.setAttached(i.isAttached());
                    return injectDocument;
                }).toList();
        inject.setDocuments(injectDocuments);
        return injectRepository.save(inject);
    }

    @PostMapping("/api/exercises/{exerciseId}/inject")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public InjectStatus executeInject(@PathVariable String exerciseId,
                                      @Valid @RequestPart("input") DirectInjectInput input,
                                      @RequestPart("file") Optional<MultipartFile> file) {
        Inject inject = input.toInject(injectorContractRepository.findById(input.getInjectorContract()).orElseThrow(ElementNotFoundException::new));
        inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow(ElementNotFoundException::new));
        inject.setExercise(exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new));
        Iterable<User> users = userRepository.findAllById(input.getUserIds());
        List<ExecutionContext> userInjectContexts = fromIterable(users).stream()
                .map(user -> this.executionContextService.executionContext(user, inject, "Direct execution")).toList();
        ExecutableInject injection = new ExecutableInject(true, true, inject, List.of(), inject.getAssets(),
                inject.getAssetGroups(), userInjectContexts);
        file.ifPresent(injection::addDirectAttachment);
        // TODO Must be migrated to Atomic approach (Inject duplication and async tracing)
        return executor.execute(injection);
    }

    @Transactional(rollbackOn = Exception.class)
    @DeleteMapping("/api/exercises/{exerciseId}/injects/{injectId}")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public void deleteInject(@PathVariable String exerciseId, @PathVariable String injectId) {
        injectDocumentRepository.deleteDocumentsFromInject(injectId);
        injectRepository.deleteById(injectId);
    }

    @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/activation")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject updateInjectActivationForExercise(
            @PathVariable String exerciseId,
            @PathVariable String injectId,
            @Valid @RequestBody InjectUpdateActivationInput input) {
        return updateInjectActivation(injectId, input);
    }

    @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/trigger")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject updateInjectTrigger(
            @PathVariable String exerciseId,
            @PathVariable String injectId,
            @Valid @RequestBody InjectUpdateTriggerInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
        inject.setDependsDuration(input.getDependsDuration());
        inject.setUpdatedAt(now());
        return injectRepository.save(inject);
    }

    @Transactional(rollbackOn = Exception.class)
    @PostMapping("/api/exercises/{exerciseId}/injects/{injectId}/status")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject setInjectStatus(@PathVariable String exerciseId, @PathVariable String injectId,
                                  @Valid @RequestBody InjectUpdateStatusInput input) {
        return injectService.updateInjectStatus(injectId, input);
    }

    @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/teams")
    @PreAuthorize("isExercisePlanner(#exerciseId)")
    public Inject updateInjectTeams(@PathVariable String exerciseId, @PathVariable String injectId,
                                    @Valid @RequestBody InjectTeamsInput input) {
        Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
        Iterable<Team> injectTeams = teamRepository.findAllById(input.getTeamIds());
        inject.setTeams(fromIterable(injectTeams));
        return injectRepository.save(inject);
    }

    @GetMapping("/api/injects/next")
    public List<Inject> nextInjectsToExecute(@RequestParam Optional<Integer> size) {
        return injectRepository.findAll(InjectSpecification.next()).stream()
                // Keep only injects visible by the user
                .filter(inject -> inject.getDate().isPresent())
                .filter(inject -> inject.getExercise()
                        .isUserHasAccess(userRepository.findById(currentUser().getId()).orElseThrow(ElementNotFoundException::new)))
                // Order by near execution
                .sorted(Inject.executionComparator)
                // Keep only the expected size
                .limit(size.orElse(MAX_NEXT_INJECTS))
                // Collect the result
                .toList();
    }

    // -- SCENARIOS --

    @PostMapping(SCENARIO_URI + "/{scenarioId}/injects")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public Inject createInjectForScenario(
            @PathVariable @NotBlank final String scenarioId,
            @Valid @RequestBody InjectInput input) {
        Scenario scenario = this.scenarioService.scenario(scenarioId);
        InjectorContract injectorContract = injectorContractRepository.findById(input.getInjectorContract()).orElseThrow(ElementNotFoundException::new);
        // Set expectations
        ObjectNode finalContent = input.getContent();
        if (input.getContent() == null || input.getContent().get("expectations").isNull() || input.getContent().get("expectations").isEmpty()) {
            try {
                JsonNode jsonNode = mapper.readTree(injectorContract.getContent());
                List<JsonNode> contractElements = StreamSupport.stream(jsonNode.get("fields").spliterator(), false).filter(contractElement -> contractElement.get("type").asText().equals(ContractType.Expectation.name().toLowerCase())).toList();
                if (!contractElements.isEmpty()) {
                    JsonNode contractElement = contractElements.getFirst();
                    if (!contractElement.get("predefinedExpectations").isNull() && !contractElement.get("predefinedExpectations").isEmpty()) {
                        finalContent = finalContent != null ? finalContent : mapper.createObjectNode();
                        ArrayNode predefinedExpectations = mapper.createArrayNode();
                        StreamSupport.stream(contractElement.get("predefinedExpectations").spliterator(), false).forEach(predefinedExpectation -> {
                            ObjectNode newExpectation = predefinedExpectation.deepCopy();
                            newExpectation.put("expectation_score", 100);
                            predefinedExpectations.add(newExpectation);
                        });
                        finalContent.put("expectations", predefinedExpectations);
                    }
                }
            } catch (JsonProcessingException e) {
                log.severe("Cannot open injector contract");
            }
        }
        input.setContent(finalContent);
        // Get common attributes
        Inject inject = input.toInject(injectorContract);
        inject.setUser(this.userRepository.findById(currentUser().getId()).orElseThrow(ElementNotFoundException::new));
        inject.setScenario(scenario);
        // Set dependencies
        inject.setDependsOn(resolveOptionalRelation(input.getDependsOn(), this.injectRepository));
        inject.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
        inject.setAssets(fromIterable(assetService.assets(input.getAssets())));
        inject.setAssetGroups(fromIterable(assetGroupService.assetGroups(input.getAssetGroups())));
        inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        List<InjectDocument> injectDocuments = input.getDocuments().stream()
                .map(i -> {
                    InjectDocument injectDocument = new InjectDocument();
                    injectDocument.setInject(inject);
                    injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow(ElementNotFoundException::new));
                    injectDocument.setAttached(i.isAttached());
                    return injectDocument;
                }).toList();
        inject.setDocuments(injectDocuments);
        return injectRepository.save(inject);
    }

    @GetMapping(SCENARIO_URI + "/{scenarioId}/injects")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Iterable<Inject> scenarioInjects(@PathVariable @NotBlank final String scenarioId) {
        return this.injectRepository.findAll(InjectSpecification.fromScenario(scenarioId))
                .stream()
                .sorted(Inject.executionComparator)
                .toList();
    }

    @GetMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}")
    @PreAuthorize("isScenarioObserver(#scenarioId)")
    public Inject scenarioInject(
            @PathVariable @NotBlank final String scenarioId,
            @PathVariable @NotBlank final String injectId) {
        Scenario scenario = this.scenarioService.scenario(scenarioId);
        assert scenarioId.equals(scenario.getId());
        return injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    }

    @Transactional(rollbackOn = Exception.class)
    @PutMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public Inject updateInjectForScenario(
            @PathVariable @NotBlank final String scenarioId,
            @PathVariable @NotBlank final String injectId,
            @Valid @RequestBody @NotNull InjectInput input) {
        Scenario scenario = this.scenarioService.scenario(scenarioId);
        Inject inject = updateInject(injectId, input);

        // If Documents not yet linked directly to the exercise, attached it
        inject.getDocuments().forEach(document -> {
            if (!document.getDocument().getScenarios().contains(scenario)) {
                scenario.getDocuments().add(document.getDocument());
            }
        });
        this.scenarioService.updateScenario(scenario);
        return injectRepository.save(inject);
    }

    @PutMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}/activation")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public Inject updateInjectActivationForScenario(
            @PathVariable @NotBlank final String scenarioId,
            @PathVariable @NotBlank final String injectId,
            @Valid @RequestBody InjectUpdateActivationInput input) {
        return updateInjectActivation(injectId, input);
    }

    @Transactional(rollbackOn = Exception.class)
    @DeleteMapping(SCENARIO_URI + "/{scenarioId}/injects/{injectId}")
    @PreAuthorize("isScenarioPlanner(#scenarioId)")
    public void deleteInjectForScenario(
            @PathVariable @NotBlank final String scenarioId,
            @PathVariable @NotBlank final String injectId) {
        Scenario scenario = this.scenarioService.scenario(scenarioId);
        assert scenarioId.equals(scenario.getId());
        this.injectDocumentRepository.deleteDocumentsFromInject(injectId);
        this.injectRepository.deleteById(injectId);
    }

    // -- PRIVATE --

    private Inject updateInject(@NotBlank final String injectId, @NotNull InjectInput input) {
        Inject inject = this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
        inject.setUpdateAttributes(input);

        // Set dependencies
        inject.setDependsOn(updateRelation(input.getDependsOn(), inject.getDependsOn(), this.injectRepository));
        inject.setTeams(fromIterable(this.teamRepository.findAllById(input.getTeams())));
        inject.setAssets(fromIterable(this.assetService.assets(input.getAssets())));
        inject.setAssetGroups(fromIterable(this.assetGroupService.assetGroups(input.getAssetGroups())));
        inject.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));

        // Set documents
        List<InjectDocumentInput> inputDocuments = input.getDocuments();
        List<InjectDocument> injectDocuments = inject.getDocuments();

        List<String> askedDocumentIds = inputDocuments.stream().map(InjectDocumentInput::getDocumentId).toList();
        List<String> currentDocumentIds = inject.getDocuments().stream().map(document -> document.getDocument().getId())
                .toList();
        // To delete
        List<InjectDocument> toRemoveDocuments = injectDocuments.stream()
                .filter(injectDoc -> !askedDocumentIds.contains(injectDoc.getDocument().getId()))
                .toList();
        injectDocuments.removeAll(toRemoveDocuments);
        // To add
        inputDocuments.stream().filter(doc -> !currentDocumentIds.contains(doc.getDocumentId())).forEach(in -> {
            Optional<Document> doc = this.documentRepository.findById(in.getDocumentId());
            if (doc.isPresent()) {
                InjectDocument injectDocument = new InjectDocument();
                injectDocument.setInject(inject);
                Document document = doc.get();
                injectDocument.setDocument(document);
                injectDocument.setAttached(in.isAttached());
                InjectDocument savedInjectDoc = this.injectDocumentRepository.save(injectDocument);
                injectDocuments.add(savedInjectDoc);
            }
        });
        // Remap the attached boolean
        injectDocuments.forEach(injectDoc -> {
            Optional<InjectDocumentInput> inputInjectDoc = input.getDocuments().stream()
                    .filter(id -> id.getDocumentId().equals(injectDoc.getDocument().getId())).findFirst();
            Boolean attached = inputInjectDoc.map(InjectDocumentInput::isAttached).orElse(false);
            injectDoc.setAttached(attached);
        });
        inject.setDocuments(injectDocuments);

        return inject;
    }

    private Inject updateInjectActivation(@NotBlank final String injectId,
                                          @NotNull final InjectUpdateActivationInput input) {
        Inject inject = this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
        inject.setEnabled(input.isEnabled());
        inject.setUpdatedAt(now());
        return injectRepository.save(inject);
    }

}
