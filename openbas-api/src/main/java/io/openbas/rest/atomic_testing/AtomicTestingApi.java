package io.openbas.rest.atomic_testing;

import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.inject_expectation.InjectExpectationService;
import io.openbas.rest.atomic_testing.form.AtomicTestingInput;
import io.openbas.rest.atomic_testing.form.AtomicTestingUpdateTagsInput;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.output.AtomicTestingOutput;
import io.openbas.service.AtomicTestingService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atomic_testings")
@PreAuthorize("isAdmin()")
@RequiredArgsConstructor
public class AtomicTestingApi extends RestBehavior {

  private final AtomicTestingService atomicTestingService;
  private final InjectExpectationService injectExpectationService;

  @PostMapping("/search")
  @Transactional(readOnly = true)
  public Page<AtomicTestingOutput> findAllAtomicTestings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return atomicTestingService.findAllAtomicTestings(searchPaginationInput);
  }

  @GetMapping("/{injectId}")
  public InjectResultDTO findAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId);
  }

  @PostMapping()
  @Transactional(rollbackFor = Exception.class)
  public InjectResultDTO createAtomicTesting(@Valid @RequestBody AtomicTestingInput input) {
    return this.atomicTestingService.createOrUpdate(input, null);
  }

  @PostMapping("/{atomicTestingId}")
  public InjectResultDTO duplicateAtomicTesting(@PathVariable final String atomicTestingId) {
    return atomicTestingService.getDuplicateAtomicTesting(atomicTestingId);
  }

  @PutMapping("/{injectId}")
  @Transactional(rollbackFor = Exception.class)
  public InjectResultDTO updateAtomicTesting(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingInput input) {
    return atomicTestingService.createOrUpdate(input, injectId);
  }

  @DeleteMapping("/{injectId}")
  public void deleteAtomicTesting(
      @PathVariable @NotBlank final String injectId) {
    atomicTestingService.deleteAtomicTesting(injectId);
  }

  @GetMapping("/try/{injectId}")
  public Inject tryAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.tryInject(injectId);
  }

  @GetMapping("/{injectId}/target_results/{targetId}/types/{targetType}")
  public List<InjectExpectation> findTargetResult(
      @PathVariable String injectId,
      @PathVariable String targetId,
      @PathVariable String targetType,
      @RequestParam(required = false) String targetParentId) {
    return injectExpectationService.findExpectationsByInjectAndTargetAndTargetType(injectId, targetId, targetParentId, targetType);
  }

  @PutMapping("/{injectId}/tags")
  @Transactional(rollbackFor = Exception.class)
  public InjectResultDTO updateAtomicTestingTags(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingUpdateTagsInput input) {
    return atomicTestingService.updateAtomicTestingTags(injectId, input);
  }


}
