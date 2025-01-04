package io.openbas.rest.atomic_testing;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.InjectExpectation;
import io.openbas.rest.atomic_testing.form.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.AtomicTestingService;
import io.openbas.service.InjectExpectationService;
import io.openbas.telemetry.Tracing;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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
  @Tracing(name = "Get a page of atomic testings", layer = "api", operation = "POST")
  public Page<InjectResultOutput> findAllAtomicTestings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return atomicTestingService.findAllAtomicTestings(searchPaginationInput);
  }

  @LogExecutionTime
  @GetMapping("/{injectId}")
  @Tracing(name = "Get a atomic testing", layer = "api", operation = "GET")
  public InjectResultOverviewOutput findAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId);
  }

  @LogExecutionTime
  @GetMapping("/{injectId}/payload")
  @Tracing(name = "Get the payload of an atomic testing", layer = "api", operation = "GET")
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

  @Tracing(name = "Duplicate an atomic testing", layer = "api", operation = "POST")
  @PostMapping("/{atomicTestingId}/duplicate")
  public InjectResultOverviewOutput duplicateAtomicTesting(
      @PathVariable @NotBlank final String atomicTestingId) {
    return atomicTestingService.duplicate(atomicTestingId);
  }

  @Tracing(name = "Launch an atomic testing", layer = "api", operation = "POST")
  @PostMapping("/{atomicTestingId}/launch")
  public InjectResultOverviewOutput launchAtomicTesting(
      @PathVariable @NotBlank final String atomicTestingId) {
    return atomicTestingService.launch(atomicTestingId);
  }

  @Tracing(name = "Relaunch an atomic testing", layer = "api", operation = "POST")
  @PostMapping("/{atomicTestingId}/relaunch")
  public InjectResultOverviewOutput relaunchAtomicTesting(
      @PathVariable @NotBlank final String atomicTestingId) {
    return atomicTestingService.relaunch(atomicTestingId);
  }

  @GetMapping("/{injectId}/target_results/{targetId}/types/{targetType}")
  public List<InjectExpectation> findTargetResult(
      @PathVariable String injectId,
      @PathVariable String targetId,
      @PathVariable String targetType,
      @RequestParam(required = false) String parentTargetId) {
    return injectExpectationService.findExpectationsByInjectAndTargetAndTargetType(
        injectId, targetId, parentTargetId, targetType);
  }

  @PutMapping("/{injectId}/tags")
  @Transactional(rollbackFor = Exception.class)
  public InjectResultOverviewOutput updateAtomicTestingTags(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingUpdateTagsInput input) {
    return atomicTestingService.updateAtomicTestingTags(injectId, input);
  }
}
