package io.openbas.rest.inject;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.aop.LogExecutionTime;
import io.openbas.authorisation.AuthorisationService;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.database.specification.InjectSpecification;
import io.openbas.rest.atomic_testing.form.ExecutionTraceOutput;
import io.openbas.rest.atomic_testing.form.InjectStatusOutput;
import io.openbas.rest.exception.BadRequestException;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.UnprocessableContentException;
import io.openbas.rest.exercise.exports.ExportOptions;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.form.*;
import io.openbas.rest.inject.service.*;
import io.openbas.rest.security.SecurityExpression;
import io.openbas.service.ImportService;
import io.openbas.service.targets.TargetService;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.TargetType;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Log
@RestController
@RequiredArgsConstructor
public class InjectApi extends RestBehavior {

  public static final String INJECT_URI = "/api/injects";

  private static final int MAX_NEXT_INJECTS = 6;

  private final AuthorisationService authorisationService;
  private final ExecutableInjectService executableInjectService;
  private final ExerciseRepository exerciseRepository;
  private final ImportService importService;
  private final InjectRepository injectRepository;
  private final InjectService injectService;
  private final InjectExecutionService injectExecutionService;
  private final InjectExportService injectExportService;
  private final ScenarioRepository scenarioRepository;
  private final TargetService targetService;
  private final UserRepository userRepository;

  // -- INJECTS --

  @GetMapping(INJECT_URI + "/{injectId}")
  public Inject inject(@PathVariable @NotBlank final String injectId) {
    return this.injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
  }

  @LogExecutionTime
  @PostMapping(INJECT_URI + "/search/export")
  public void injectsExportFromSearch(
      @RequestBody @Valid InjectExportFromSearchRequestInput input, HttpServletResponse response)
      throws IOException {

    // Control and format inputs
    List<Inject> injects =
        getInjectsAndCheckInputForBulkProcessing(input, Grant.GRANT_TYPE.OBSERVER);
    runInjectExport(
        injects,
        ExportOptions.mask(
            input.getExportOptions().isWithPlayers(),
            input.getExportOptions().isWithTeams(),
            input.getExportOptions().isWithVariableValues()),
        response);
  }

  @PostMapping(INJECT_URI + "/export")
  public void injectsExport(
      @RequestBody @Valid final InjectExportRequestInput injectExportRequestInput,
      HttpServletResponse response)
      throws IOException {
    List<String> targetIds = injectExportRequestInput.getTargetsIds();
    List<Inject> injects = injectRepository.findAllById(targetIds);

    List<String> foundIds = injects.stream().map(Inject::getId).toList();
    List<String> missedIds =
        new ArrayList<>(targetIds.stream().filter(id -> !foundIds.contains(id)).toList());
    missedIds.addAll(
        injectService
            .authorise(injects, SecurityExpression::isInjectObserver)
            .getUnauthorised()
            .stream()
            .map(Inject::getId)
            .toList());

    if (!missedIds.isEmpty()) {
      throw new ElementNotFoundException(String.join(", ", missedIds));
    }

    int exportOptionsMask =
        ExportOptions.mask(
            injectExportRequestInput.getExportOptions().isWithPlayers(),
            injectExportRequestInput.getExportOptions().isWithTeams(),
            injectExportRequestInput.getExportOptions().isWithVariableValues());
    runInjectExport(injects, exportOptionsMask, response);
  }

  private void runInjectExport(
      List<Inject> injects, int exportOptionsMask, HttpServletResponse response)
      throws IOException {
    byte[] zippedExport = injectExportService.exportInjectsToZip(injects, exportOptionsMask);
    String zipName = injectExportService.getZipFileName(exportOptionsMask);

    response.addHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + zipName);
    response.addHeader(HttpHeaders.CONTENT_TYPE, "application/zip");
    response.setStatus(HttpServletResponse.SC_OK);
    ServletOutputStream outputStream = response.getOutputStream();
    outputStream.write(zippedExport);
    outputStream.close();
  }

  /**
   * Returns a page of inject target results based on search parameters
   *
   * @param injectId ID of the inject owning the targets
   * @param targetType Type of the searched targets
   * @param input Search terms specification
   */
  @Operation(summary = "Search inject targets by inject and by target type")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "A page of inject target results is fetched successfully"),
        @ApiResponse(responseCode = "404", description = "The inject ID was not found"),
        @ApiResponse(responseCode = "400", description = "An invalid target type was specified")
      })
  @LogExecutionTime
  @PostMapping(path = INJECT_URI + "/{injectId}/targets/{targetType}/search")
  @PreAuthorize("isInjectObserver(#injectId)")
  public Page<InjectTarget> injectTargetSearch(
      @PathVariable String injectId,
      @PathVariable String targetType,
      @Valid @RequestBody SearchPaginationInput input) {
    TargetType injectTargetTypeEnum;

    try {
      injectTargetTypeEnum = TargetType.valueOf(targetType);
    } catch (IllegalArgumentException e) {
      throw new BadRequestException(String.format("Invalid target type %s", targetType));
    }

    Inject inject = injectService.inject(injectId);

    return targetService.searchTargets(injectTargetTypeEnum, inject, input);
  }

  /**
   * Returns all possible filter value options for the given target type and inject
   *
   * @param injectId ID of the inject owning the potential options
   * @param targetType Type of the desired targets as options
   * @param searchText Additional filter on target label
   */
  @Operation(summary = "Get filter values options from possible targets by target type and inject")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Target as option values fetched successfully"),
        @ApiResponse(responseCode = "404", description = "The inject ID was not found"),
        @ApiResponse(responseCode = "400", description = "An invalid target type was specified")
      })
  @LogExecutionTime
  @GetMapping(path = INJECT_URI + "/{injectId}/targets/{targetType}/options")
  @PreAuthorize("isInjectObserver(#injectId)")
  public List<FilterUtilsJpa.Option> targetOptions(
      @PathVariable String injectId,
      @PathVariable String targetType,
      @RequestParam(required = false) final String searchText) {
    TargetType injectTargetTypeEnum;

    try {
      injectTargetTypeEnum = TargetType.valueOf(targetType);
    } catch (IllegalArgumentException e) {
      throw new BadRequestException(String.format("Invalid target type %s", targetType));
    }

    Inject inject = injectService.inject(injectId);

    return targetService.getTargetOptions(
        injectTargetTypeEnum, inject, StringUtils.trimToEmpty(searchText));
  }

  /**
   * Returns possible filter value options for the given target ids
   *
   * @param targetType Type of the desired targets as options
   * @param ids IDs of the target options to fetch
   */
  @Operation(summary = "Get filter values options from possible targets by IDs")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Target as option values fetched successfully"),
        @ApiResponse(responseCode = "400", description = "An invalid target type was specified")
      })
  @LogExecutionTime
  @PostMapping(path = INJECT_URI + "/targets/{targetType}/options")
  public List<FilterUtilsJpa.Option> targetOptionsById(
      @PathVariable String targetType, @RequestBody final List<String> ids) {
    TargetType injectTargetTypeEnum;

    try {
      injectTargetTypeEnum = TargetType.valueOf(targetType);
    } catch (IllegalArgumentException e) {
      throw new BadRequestException(String.format("Invalid target type %s", targetType));
    }
    return targetService.getTargetOptionsByIds(injectTargetTypeEnum, ids);
  }

  @PostMapping(
      path = INJECT_URI + "/import",
      consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
  public void injectsImport(
      @RequestPart("file") MultipartFile file,
      @RequestPart("input") InjectImportInput input,
      HttpServletResponse response)
      throws Exception {
    // find target
    if (input == null || input.getTarget() == null) {
      throw new UnprocessableContentException("Insufficient input: target must not be null");
    }
    if (!List.of(InjectImportTargetType.values()).contains(input.getTarget().getType())) {
      throw new UnprocessableContentException(
          "Invalid target type: must be one of %s"
              .formatted(
                  String.join(
                      ", ",
                      Arrays.stream(InjectImportTargetType.values())
                          .map(Enum::toString)
                          .toList())));
    }

    Exercise targetExercise = null;
    Scenario targetScenario = null;

    if (input.getTarget().getType().equals(InjectImportTargetType.SIMULATION)) {
      targetExercise =
          exerciseRepository
              .findById(input.getTarget().getId())
              .orElseThrow(ElementNotFoundException::new);
      if (!authorisationService
          .getSecurityExpression()
          .isSimulationPlanner(targetExercise.getId())) {
        throw new AccessDeniedException(
            "Insufficient privileges to act on simulation id#%s".formatted(targetExercise.getId()));
      }
    }

    if (input.getTarget().getType().equals(InjectImportTargetType.SCENARIO)) {
      targetScenario =
          scenarioRepository
              .findById(input.getTarget().getId())
              .orElseThrow(ElementNotFoundException::new);
      if (!authorisationService.getSecurityExpression().isScenarioPlanner(targetScenario.getId())) {
        throw new AccessDeniedException(
            "Insufficient privileges to act on scenario id#%s".formatted(targetScenario.getId()));
      }
    }

    if (input.getTarget().getType().equals(InjectImportTargetType.ATOMIC_TESTING)) {
      if (!authorisationService.getSecurityExpression().isAdmin()) {
        throw new AccessDeniedException(
            "Insufficient privileges: must be admin to act on atomic testing");
      }
    }

    this.importService.handleFileImport(file, targetExercise, targetScenario);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(INJECT_URI + "/execution/reception/{injectId}")
  public Inject injectExecutionReception(
      @PathVariable String injectId, @Valid @RequestBody InjectReceptionInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow(ElementNotFoundException::new);
    inject.setFirstExecutionDate(Instant.now()); // TODO POC
    inject.setStatus(ExecutionStatus.PENDING); // TODO POC
    InjectStatus injectStatus =
        inject.getExecution().orElseThrow(ElementNotFoundException::new); // TODO POC
    injectStatus.setName(ExecutionStatus.PENDING);
    return injectRepository.save(inject);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(INJECT_URI + "/execution/callback/{injectId}")
  public void injectExecutionCallback(
      @PathVariable String injectId, @Valid @RequestBody InjectExecutionInput input) {
    injectExecutionCallback(null, injectId, input);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(INJECT_URI + "/execution/{agentId}/callback/{injectId}")
  public void injectExecutionCallback(
      @PathVariable
          String agentId, // must allow null because http injector used also this method to work.
      @PathVariable String injectId,
      @Valid @RequestBody InjectExecutionInput input) {
    injectExecutionService.handleInjectExecutionCallback(injectId, agentId, input);
  }

  @Secured(ROLE_ADMIN)
  @GetMapping(INJECT_URI + "/{injectId}/{agentId}/executable-payload")
  @Operation(
      summary = "Get the payload ready to be executed",
      description =
          "This endpoint is invoked by implants to retrieve a payload command that's pre-configured and ready for execution.")
  public Payload getExecutablePayloadInject(
      @PathVariable @NotBlank final String injectId, @PathVariable @NotBlank final String agentId)
      throws Exception {
    return executableInjectService.getExecutablePayloadAndUpdateInjectStatus(injectId, agentId);
  }

  // -- EXERCISES --

  @Transactional(rollbackFor = Exception.class)
  @PutMapping(INJECT_URI + "/{exerciseId}/{injectId}")
  @PreAuthorize("isExercisePlanner(#exerciseId)")
  public Inject updateInject(
      @PathVariable String exerciseId,
      @PathVariable String injectId,
      @Valid @RequestBody InjectInput input) {
    Exercise exercise =
        exerciseRepository.findById(exerciseId).orElseThrow(ElementNotFoundException::new);
    Inject inject = injectService.updateInject(injectId, input);

    // It should not be possible to add a EE executor on inject when the exercise is already
    // started.
    if (exercise.getStart().isPresent()) {
      this.injectService.throwIfInjectNotLaunchable(inject);
    }

    // If Documents not yet linked directly to the exercise, attached it
    inject
        .getDocuments()
        .forEach(
            document -> {
              if (!document.getDocument().getExercises().contains(exercise)) {
                exercise.getDocuments().add(document.getDocument());
              }
            });
    this.exerciseRepository.save(exercise);
    return injectRepository.save(inject);
  }

  @GetMapping(INJECT_URI + "/next")
  public List<Inject> nextInjectsToExecute(@RequestParam Optional<Integer> size) {
    return injectRepository.findAll(InjectSpecification.next()).stream()
        // Keep only injects visible by the user
        .filter(inject -> inject.getDate().isPresent())
        .filter(
            inject ->
                inject
                    .getExercise()
                    .isUserHasAccess(
                        userRepository
                            .findById(currentUser().getId())
                            .orElseThrow(
                                () -> new ElementNotFoundException("Current user not found"))))
        // Order by near execution
        .sorted(Inject.executionComparator)
        // Keep only the expected size
        .limit(size.orElse(MAX_NEXT_INJECTS))
        // Collect the result
        .toList();
  }

  @Operation(
      description = "Bulk update of injects",
      tags = {"Injects"})
  @Transactional(rollbackFor = Exception.class)
  @PutMapping(INJECT_URI)
  @LogExecutionTime
  public List<Inject> bulkUpdateInject(@RequestBody @Valid final InjectBulkUpdateInputs input) {

    // Control and format inputs
    List<Inject> injectsToUpdate =
        getInjectsAndCheckInputForBulkProcessing(input, Grant.GRANT_TYPE.PLANNER);

    // Bulk update
    return this.injectService.bulkUpdateInject(injectsToUpdate, input.getUpdateOperations());
  }

  @Operation(
      description = "Bulk delete of injects",
      tags = {"injects-api"})
  @Transactional(rollbackFor = Exception.class)
  @DeleteMapping(INJECT_URI)
  @LogExecutionTime
  public List<Inject> bulkDelete(@RequestBody @Valid final InjectBulkProcessingInput input) {

    // Control and format inputs
    List<Inject> injectsToDelete =
        getInjectsAndCheckInputForBulkProcessing(input, Grant.GRANT_TYPE.PLANNER);

    // FIXME: This is a workaround to prevent the GUI from blocking when deleting elements
    injectsToDelete.forEach(inject -> inject.setListened(false));

    // Bulk delete
    this.injectService.deleteAll(injectsToDelete);
    return injectsToDelete;
  }

  // -- OPTION --

  @GetMapping(INJECT_URI + "/findings/options")
  public List<FilterUtilsJpa.Option> optionsByTitleLinkedToFindings(
      @RequestParam(required = false) final String searchText,
      @RequestParam(required = false) final String sourceId) {
    return injectService.getOptionsByNameLinkedToFindings(
        searchText, sourceId, PageRequest.of(0, 50));
  }

  @PostMapping(INJECT_URI + "/options")
  public List<FilterUtilsJpa.Option> optionsById(@RequestBody final List<String> ids) {
    return fromIterable(this.injectRepository.findAllById(ids)).stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getTitle()))
        .toList();
  }

  /**
   * Retrieve injects that match the search input and check that the user is allowed to bulk process
   * them
   *
   * @param input The input for the bulk processing
   * @return The list of injects to process
   * @throws BadRequestException If the input is not correctly formatted
   */
  private List<Inject> getInjectsAndCheckInputForBulkProcessing(
      InjectBulkProcessingInput input, Grant.GRANT_TYPE requested_grant_level) {
    // Control and format inputs
    if ((CollectionUtils.isEmpty(input.getInjectIDsToProcess())
            && (input.getSearchPaginationInput() == null))
        || (!CollectionUtils.isEmpty(input.getInjectIDsToProcess())
            && (input.getSearchPaginationInput() != null))) {
      throw new BadRequestException(
          "Either inject_ids_to_process or search_pagination_input must be provided, and not both at the same time");
    }

    // Retrieve injects that match the search input and check that the user is allowed to bulk
    // process them
    return this.injectService.getInjectsAndCheckPermission(input, requested_grant_level);
  }

  // -- Execution Traces
  @Operation(
      description =
          "Get ExecutionTraces from a specific inject and target (asset, agent, team, player)")
  @GetMapping(INJECT_URI + "/execution-traces")
  @LogExecutionTime
  public List<ExecutionTraceOutput> getInjectTracesFromInjectAndTarget(
      @RequestParam String injectId,
      @RequestParam String targetId,
      @RequestParam TargetType targetType) {
    return this.injectService.getInjectTracesFromInjectAndTarget(injectId, targetId, targetType);
  }

  @Operation(description = "Get InjectStatus with global execution traces")
  @GetMapping(INJECT_URI + "/status")
  @LogExecutionTime
  public InjectStatusOutput getInjectStatusWithGlobalExecutionTraces(
      @RequestParam String injectId) {
    return this.injectService.getInjectStatusWithGlobalExecutionTraces(injectId);
  }
}
