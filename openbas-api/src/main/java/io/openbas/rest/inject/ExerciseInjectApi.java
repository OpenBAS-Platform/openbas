package io.openbas.rest.inject;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.specification.CommunicationSpecification.fromInject;
import static io.openbas.database.specification.InjectSpecification.fromSimulation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static java.time.Instant.now;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.execution.ExecutionContext;
import io.openbas.execution.ExecutionContextService;
import io.openbas.executors.Executor;
import io.openbas.rest.atomic_testing.form.InjectResultOutput;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.*;
import io.openbas.rest.inject.output.InjectOutput;
import io.openbas.rest.inject.output.InjectTestStatusOutput;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.rest.inject.service.InjectStatusService;
import io.openbas.service.InjectSearchService;
import io.openbas.service.InjectTestStatusService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.persistence.criteria.Join;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Level;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Log
@RestController
@RequiredArgsConstructor
public class ExerciseInjectApi extends RestBehavior {

  private final InjectSearchService injectSearchService;
  private final InjectTestStatusService injectTestStatusService;
  private final Executor executor;
  private final InjectorContractRepository injectorContractRepository;
  private final CommunicationRepository communicationRepository;
  private final ExerciseRepository exerciseRepository;
  private final UserRepository userRepository;
  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final TeamRepository teamRepository;
  private final ExecutionContextService executionContextService;
  private final InjectService injectService;
  private final InjectDuplicateService injectDuplicateService;
  private final InjectStatusService injectStatusService;

  @Operation(summary = "Retrieved injects for an exercise")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Retrieved injects for an exercise",
            content = {
              @Content(
                  mediaType = "application/json",
                  schema = @Schema(implementation = InjectOutput.class))
            }),
      })
  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/simple")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> exerciseInjectsSimple(
      @PathVariable @NotBlank final String exerciseId) {
    return injectSearchService.injects(fromSimulation(exerciseId));
  }

  @PostMapping(EXERCISE_URI + "/{exerciseId}/injects/simple")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  public Iterable<InjectOutput> exerciseInjectsSimple(
      @PathVariable @NotBlank final String exerciseId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    Map<String, Join<Base, Base>> joinMap = new HashMap<>();
    return buildPaginationCriteriaBuilder(
        (Specification<Inject> specification,
            Specification<Inject> specificationCount,
            Pageable pageable) ->
            this.injectSearchService.injects(
                fromSimulation(exerciseId).and(specification),
                fromSimulation(exerciseId).and(specificationCount),
                pageable,
                joinMap),
        searchPaginationInput,
        Inject.class,
        joinMap);
  }

  /**
   * @deprecated since 1.16.0, forRemoval = true
   * @see #findExercisePageInjectTests
   */
  @PostMapping("/api/exercise/{exerciseId}/injects/test")
  public Page<InjectTestStatusOutput> findAllExerciseInjectTests(
      @PathVariable @NotBlank String exerciseId,
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return injectTestStatusService.findAllInjectTestsByExerciseId(
        exerciseId, searchPaginationInput);
  }

  @PostMapping(EXERCISE_URI + "/{exerciseId}/injects/test")
  public Page<InjectTestStatusOutput> findExercisePageInjectTests(
      @PathVariable @NotBlank String exerciseId,
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return injectTestStatusService.findAllInjectTestsByExerciseId(
        exerciseId, searchPaginationInput);
  }

  @LogExecutionTime
  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Inject> exerciseInjects(@PathVariable @NotBlank final String exerciseId) {
    return injectRepository.findByExerciseId(exerciseId).stream()
        .sorted(Inject.executionComparator)
        .toList();
  }

  @LogExecutionTime
  @PostMapping(EXERCISE_URI + "/{exerciseId}/injects/search")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  public Page<InjectResultOutput> searchExerciseInjects(
      @PathVariable final String exerciseId,
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return injectSearchService.getPageOfInjectResults(exerciseId, searchPaginationInput);
  }

  @LogExecutionTime
  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/results")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  @Transactional(readOnly = true)
  public List<InjectResultOutput> exerciseInjectsResults(@PathVariable final String exerciseId) {
    return injectSearchService.getListOfInjectResults(exerciseId);
  }

  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Inject exerciseInject(@PathVariable String exerciseId, @PathVariable String injectId) {
    return injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
  }

  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}/teams")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Team> exerciseInjectTeams(
      @PathVariable String exerciseId, @PathVariable String injectId) {
    return injectRepository
        .findById(injectId)
        .orElseThrow(ElementNotFoundException::new)
        .getTeams();
  }

  @GetMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}/communications")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Iterable<Communication> exerciseInjectCommunications(
      @PathVariable String exerciseId, @PathVariable String injectId) {
    List<Communication> coms =
        communicationRepository.findAll(
            fromInject(injectId), Sort.by(Sort.Direction.DESC, "receivedAt"));
    List<Communication> ackComs = coms.stream().peek(com -> com.setAck(true)).toList();
    return communicationRepository.saveAll(ackComs);
  }

  @PostMapping(EXERCISE_URI + "/{exerciseId}/injects")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  @Transactional(rollbackFor = Exception.class)
  public Inject createInjectForExercise(
      @PathVariable String exerciseId, @Valid @RequestBody InjectInput input) {
    Exercise exercise =
        exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    return this.injectService.createInject(exercise, null, input);
  }

  @PostMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject duplicateInjectForExercise(
      @PathVariable @NotBlank final String exerciseId,
      @PathVariable @NotBlank final String injectId) {
    return injectDuplicateService.duplicateInjectForExerciseWithDuplicateWordInTitle(
        exerciseId, injectId);
  }

  @Transactional(rollbackFor = Exception.class)
  @PostMapping(value = EXERCISE_URI + "/{exerciseId}/inject")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void executeInject( // TODO POC : USed Reply Inject/Emails/
      @PathVariable @NotBlank final String exerciseId,
      @Valid @RequestPart("input") DirectInjectInput input,
      @RequestPart("file") Optional<MultipartFile> file) {
    Inject inject =
        input.toInject(
            this.injectorContractRepository
                .findById(input.getInjectorContract())
                .orElseThrow(() -> new ElementNotFoundException("Injector contract not found")));
    inject.setUser(
        this.userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new ElementNotFoundException("Current user not found")));
    inject.setExercise(
        this.exerciseRepository
            .findById(exerciseId)
            .orElseThrow(() -> new ElementNotFoundException("Exercise not found")));
    inject.setDependsDuration(0L);
    Inject savedInject = this.injectRepository.save(inject);
    Iterable<User> users = this.userRepository.findAllById(input.getUserIds());
    List<ExecutionContext> userInjectContexts =
        fromIterable(users).stream()
            .map(
                user ->
                    this.executionContextService.executionContext(
                        user, savedInject, "Direct execution"))
            .collect(Collectors.toList());
    ExecutableInject injection =
        new ExecutableInject(
            true,
            true,
            savedInject,
            List.of(),
            savedInject.getAssets(),
            savedInject.getAssetGroups(),
            userInjectContexts);
    file.ifPresent(injection::addDirectAttachment);
    try {
      executor.directExecute(injection);
    } catch (Exception e) {
      log.log(Level.WARNING, e.getMessage(), e);
      injectStatusService.failInjectStatus(inject.getId(), e.getMessage());
    }
  }

  @Transactional(rollbackFor = Exception.class)
  @DeleteMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public void deleteInject(@PathVariable String exerciseId, @PathVariable String injectId) {
    injectDocumentRepository.deleteDocumentsFromInject(injectId);
    injectRepository.deleteById(injectId);
  }

  @PutMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}/activation")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject updateInjectActivationForExercise(
      @PathVariable String exerciseId,
      @PathVariable String injectId,
      @Valid @RequestBody InjectUpdateActivationInput input) {
    return injectService.updateInjectActivation(injectId, input);
  }

  @PutMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}/trigger")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject updateInjectTrigger(
      @PathVariable String exerciseId, @PathVariable String injectId) {
    Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    inject.setTriggerNowDate(now());
    inject.setUpdatedAt(now());
    return injectRepository.save(inject);
  }

  @Transactional(rollbackFor = Exception.class)
  @PostMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}/status")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject setInjectStatus( // TODO POC REname update Manual inject
      @PathVariable String exerciseId,
      @PathVariable String injectId,
      @Valid @RequestBody InjectUpdateStatusInput input) {
    return injectStatusService.updateInjectStatus(injectId, input);
  }

  @PutMapping(EXERCISE_URI + "/{exerciseId}/injects/{injectId}/teams")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject updateInjectTeams(
      @PathVariable String exerciseId,
      @PathVariable String injectId,
      @Valid @RequestBody InjectTeamsInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    Iterable<Team> injectTeams = teamRepository.findAllById(input.getTeamIds());
    inject.setTeams(fromIterable(injectTeams));
    return injectRepository.save(inject);
  }
}
