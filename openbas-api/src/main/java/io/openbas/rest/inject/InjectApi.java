package io.openbas.rest.inject;

import io.openbas.asset.AssetGroupService;
import io.openbas.asset.AssetService;
import io.openbas.contract.Contract;
import io.openbas.contract.ContractService;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.execution.Injector;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.*;
import io.openbas.service.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.ExecutionTrace.traceSuccess;
import static io.openbas.database.specification.CommunicationSpecification.fromInject;
import static io.openbas.helper.DatabaseHelper.resolveOptionalRelation;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static java.time.Instant.now;

@RestController
public class InjectApi extends RestBehavior {

  private static final int MAX_NEXT_INJECTS = 6;

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
  private ApplicationContext context;
  private ContractService contractService;
  private ExecutionContextService executionContextService;
  private ScenarioService scenarioService;

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
  public void setContractService(ContractService contractService) {
    this.contractService = contractService;
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
  public void setContext(ApplicationContext context) {
    this.context = context;
  }
  @Autowired
  public void setExecutionContextService(@NotNull final ExecutionContextService executionContextService) {
    this.executionContextService = executionContextService;
  }

  @GetMapping("/api/inject_types")
  public Collection<Contract> injectTypes() {
    return contractService.getContracts().values();
  }

  @GetMapping("/api/injects/try/{injectId}")
  public InjectStatus tryInject(@PathVariable String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    User user = this.userRepository.findById(currentUser().getId()).orElseThrow();
    List<ExecutionContext> userInjectContexts = List.of(
        this.executionContextService.executionContext(user, inject, "Direct test")
    );
    Contract contract = contractService.resolveContract(inject);
    if (contract == null) {
      throw new UnsupportedOperationException("Unknown inject contract " + inject.getContract());
    }
    ExecutableInject injection = new ExecutableInject(false, true, inject, contract, List.of(), inject.getAssets(), inject.getAssetGroups(), userInjectContexts);
    Injector executor = context.getBean(contract.getConfig().getType(), Injector.class);
    Execution execution = executor.executeInjection(injection);
    return InjectStatus.fromExecution(execution, inject);
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping("/api/injects/{exerciseId}/{injectId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject updateInject(
      @PathVariable String exerciseId,
      @PathVariable String injectId,
      @Valid @RequestBody InjectInput input) {
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
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

  @GetMapping("/api/exercises/{exerciseId}/injects")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Inject> exerciseInjects(@PathVariable String exerciseId) {
    return injectRepository.findAll(InjectSpecification.fromExercise(exerciseId)).stream()
        .sorted(Inject.executionComparator).toList();
  }

  @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Inject exerciseInject(@PathVariable String exerciseId, @PathVariable String injectId) {
    return injectRepository.findById(injectId).orElseThrow();
  }

  @GetMapping("/api/exercises/{exerciseId}/injects/{injectId}/teams")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Team> exerciseInjectTeams(@PathVariable String exerciseId, @PathVariable String injectId) {
    return injectRepository.findById(injectId).orElseThrow().getTeams();
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
    Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow();
    // Get common attributes
    Inject inject = input.toInject();
    inject.setType(contractService.getContractType(input.getContract()));
    inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
    inject.setExercise(exercise);
    // Set dependencies
    inject.setDependsOn(resolveOptionalRelation(input.getDependsOn(), injectRepository));
    inject.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
    inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    List<InjectDocument> injectDocuments = input.getDocuments().stream()
        .map(i -> {
          InjectDocument injectDocument = new InjectDocument();
          injectDocument.setInject(inject);
          injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow());
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
    Inject inject = input.toInject();
    Contract contract = contractService.resolveContract(inject);
    if (contract == null) {
      throw new UnsupportedOperationException("Unknown inject contract " + inject.getContract());
    }
    inject.setType(contract.getConfig().getType());
    inject.setUser(userRepository.findById(currentUser().getId()).orElseThrow());
    inject.setExercise(exerciseRepository.findById(exerciseId).orElseThrow());
    Iterable<User> users = userRepository.findAllById(input.getUserIds());
    List<ExecutionContext> userInjectContexts = fromIterable(users).stream()
        .map(user -> this.executionContextService.executionContext(user, inject, "Direct execution")).toList();
    ExecutableInject injection = new ExecutableInject(true, true, inject, contract, List.of(), inject.getAssets(), inject.getAssetGroups(), userInjectContexts);
    file.ifPresent(injection::addDirectAttachment);
    Injector executor = context.getBean(contract.getConfig().getType(), Injector.class);
    Execution execution = executor.executeInjection(injection);
    return InjectStatus.fromExecution(execution, inject);
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
  public Inject updateInjectTrigger(@PathVariable String exerciseId, @PathVariable String injectId,
      @Valid @RequestBody InjectUpdateTriggerInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    inject.setDependsDuration(input.getDependsDuration());
    inject.setUpdatedAt(now());
    return injectRepository.save(inject);
  }

  @Transactional(rollbackOn = Exception.class)
  @PostMapping("/api/exercises/{exerciseId}/injects/{injectId}/status")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject setInjectStatus(@PathVariable String exerciseId, @PathVariable String injectId,
      @Valid @RequestBody InjectUpdateStatusInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setDate(now());
    injectStatus.setName(input.getStatus());
    injectStatus.setExecutionTime(0);
    Execution execution = new Execution(false);
    execution.addTrace(traceSuccess(currentUser().getId(), input.getMessage()));
    execution.stop();
    injectStatus.setReporting(execution);
    // Save status for inject
    inject.setStatus(injectStatus);
    return injectRepository.save(inject);
  }

  @PutMapping("/api/exercises/{exerciseId}/injects/{injectId}/teams")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject updateInjectTeams(@PathVariable String exerciseId, @PathVariable String injectId,
      @Valid @RequestBody InjectTeamsInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
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
            .isUserHasAccess(userRepository.findById(currentUser().getId()).orElseThrow()))
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
    // Get common attributes
    Inject inject = input.toInject();
    inject.setType(this.contractService.getContractType(input.getContract()));
    inject.setUser(this.userRepository.findById(currentUser().getId()).orElseThrow());
    inject.setScenario(scenario);
    // Set dependencies
    inject.setDependsOn(resolveOptionalRelation(input.getDependsOn(), this.injectRepository));
    inject.setTeams(fromIterable(teamRepository.findAllById(input.getTeams())));
    inject.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
    List<InjectDocument> injectDocuments = input.getDocuments().stream()
        .map(i -> {
          InjectDocument injectDocument = new InjectDocument();
          injectDocument.setInject(inject);
          injectDocument.setDocument(documentRepository.findById(i.getDocumentId()).orElseThrow());
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
    return injectRepository.findById(injectId).orElseThrow();
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

  private Inject updateInject(@NotBlank final String injectId, @NotNull InjectInput input) {
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
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

  private Inject updateInjectActivation(@NotBlank final String injectId, @NotNull final InjectUpdateActivationInput input) {
    Inject inject = this.injectRepository.findById(injectId).orElseThrow();
    inject.setEnabled(input.isEnabled());
    inject.setUpdatedAt(now());
    return injectRepository.save(inject);
  }

}
