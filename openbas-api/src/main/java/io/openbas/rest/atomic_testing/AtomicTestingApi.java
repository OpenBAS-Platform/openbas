package io.openbas.rest.atomic_testing;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.InjectExpectation;
import io.openbas.rest.atomic_testing.form.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.AtomicTestingService;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(AtomicTestingApi.ATOMIC_TESTING_URI)
@PreAuthorize("isAdmin()")
@RequiredArgsConstructor
public class AtomicTestingApi extends RestBehavior {

  public static final String ATOMIC_TESTING_URI = "/api/atomic-testings";

  private final AtomicTestingService atomicTestingService;
  private final InjectExpectationService injectExpectationService;

  @LogExecutionTime
  @PostMapping("/search")
  @Transactional(readOnly = true)
  public Page<InjectResultOutput> findAllAtomicTestings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return atomicTestingService.searchAtomicTestings(searchPaginationInput);
  }

  @LogExecutionTime
  @GetMapping("/{injectId}")
  @PreAuthorize("isInjectObserver(#injectId)")
  public InjectResultOverviewOutput findAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId);
  }

  @LogExecutionTime
  @GetMapping("/{injectId}/payload")
  public StatusPayloadOutput findAtomicTestingPayload(@PathVariable String injectId) {
    return atomicTestingService.findPayloadOutputByInjectId(injectId);
  }

  @PostMapping()
  @Transactional(rollbackFor = Exception.class)
  public InjectResultOverviewOutput createAtomicTesting(
      @Valid @RequestBody AtomicTestingInput input) {
    return this.atomicTestingService.createOrUpdate(input, null);
  }

  @PutMapping("/{injectId}")
  @Transactional(rollbackFor = Exception.class)
  public InjectResultOverviewOutput updateAtomicTesting(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingInput input) {
    return atomicTestingService.createOrUpdate(input, injectId);
  }

  @DeleteMapping("/{injectId}")
  public void deleteAtomicTesting(@PathVariable @NotBlank final String injectId) {
    atomicTestingService.deleteAtomicTesting(injectId);
  }

  @PostMapping("/{atomicTestingId}/duplicate")
  public InjectResultOverviewOutput duplicateAtomicTesting(
      @PathVariable @NotBlank final String atomicTestingId) {
    return atomicTestingService.duplicate(atomicTestingId);
  }

  @PostMapping("/{atomicTestingId}/launch")
  public InjectResultOverviewOutput launchAtomicTesting(
      @PathVariable @NotBlank final String atomicTestingId) {
    return atomicTestingService.launch(atomicTestingId);
  }

  @PostMapping("/{atomicTestingId}/relaunch")
  public InjectResultOverviewOutput relaunchAtomicTesting(
      @PathVariable @NotBlank final String atomicTestingId) {
    return atomicTestingService.relaunch(atomicTestingId);
  }

  @GetMapping("/{injectId}/target_results/{targetId}/types/{targetType}")
  @PreAuthorize("isInjectObserver(#injectId)")
  public List<InjectExpectation> findTargetResult(
      @PathVariable String injectId,
      @PathVariable String targetId,
      @PathVariable String targetType,
      @RequestParam(required = false) String parentTargetId) {
    return injectExpectationService.findMergedExpectationsByInjectAndTargetAndTargetType(
        injectId, targetId, parentTargetId, targetType);
  }

  /**
   * Returns expectations for inject target with results merged across all expectations of the same
   * type
   *
   * @param injectId ID of the inject owning the targets
   * @param targetId ID of the specific target
   * @param targetType Type of the specified target
   */
  @Operation(
      summary =
          "Fetch target expectations with merged results across all occurrences of each expectation type")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Expectation results fetched successfully"),
        @ApiResponse(responseCode = "400", description = "An invalid target type was specified")
      })
  @GetMapping("/{injectId}/target_results/{targetId}/types/{targetType}/merged")
  @PreAuthorize("isInjectObserver(#injectId)")
  public List<InjectExpectation> findTargetResultMerged(
      @PathVariable String injectId,
      @PathVariable String targetId,
      @PathVariable String targetType) {
    return injectExpectationService
        .findMergedExpectationsByInjectAndTargetAndTargetType(injectId, targetId, targetType)
        .stream()
        .sorted(Comparator.comparing(InjectExpectation::getType))
        .toList();
  }

  @PutMapping("/{injectId}/tags")
  @Transactional(rollbackFor = Exception.class)
  public InjectResultOverviewOutput updateAtomicTestingTags(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingUpdateTagsInput input) {
    return atomicTestingService.updateAtomicTestingTags(injectId, input);
  }
}
