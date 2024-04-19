package io.openbas.atomic_testing;

import io.openbas.atomic_testing.form.AtomicTestingDetailOutput;
import io.openbas.atomic_testing.form.AtomicTestingInput;
import io.openbas.atomic_testing.form.AtomicTestingOutput;
import io.openbas.atomic_testing.form.SimpleExpectationResultOutput;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectStatus;
import io.openbas.inject_expectation.InjectExpectationService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atomic_testings")
@PreAuthorize("isAdmin()")
public class AtomicTestingApi extends RestBehavior {

  private AtomicTestingService atomicTestingService;
  private InjectExpectationService injectExpectationService;

  @Autowired
  public void setAtomicTestingService(AtomicTestingService atomicTestingService) {
    this.atomicTestingService = atomicTestingService;
  }

  @Autowired
  public void setInjectExpectationService(InjectExpectationService injectExpectationService) {
    this.injectExpectationService = injectExpectationService;
  }

  @PostMapping("/search")
  public Page<AtomicTestingOutput> findAllAtomicTestings(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return atomicTestingService.findAllAtomicTestings(searchPaginationInput)
        .map(AtomicTestingMapper::toDto);
  }


  @GetMapping("/{injectId}")
  public AtomicTestingOutput findAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId)
        .map(AtomicTestingMapper::toDtoWithTargetResults)
        .orElseThrow();
  }

  @GetMapping("/{injectId}/detail")
  public AtomicTestingDetailOutput findAtomicTestingWithDetail(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId).map(AtomicTestingMapper::toDetailDto).orElseThrow();
  }

  @GetMapping("/{injectId}/update")
  public Inject findAtomicTestingForUpdate(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId).orElseThrow();
  }

  @PostMapping()
  public AtomicTestingOutput createAtomicTesting(@Valid @RequestBody AtomicTestingInput input) {
    return AtomicTestingMapper.toDto(atomicTestingService.createOrUpdate(input, null));
  }

  @PutMapping("/{injectId}")
  public AtomicTestingOutput updateAtomicTesting(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingInput input) {
    return AtomicTestingMapper.toDto(atomicTestingService.createOrUpdate(input, injectId));
  }

  @DeleteMapping("/{injectId}")
  public void deleteAtomicTesting(
      @PathVariable @NotBlank final String injectId) {
    atomicTestingService.deleteAtomicTesting(injectId);
  }

  @GetMapping("/try/{injectId}")
  public InjectStatus tryAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.tryInject(injectId);
  }

  @GetMapping("/{injectId}/target_results/{targetId}/types/{targetType}")
  public List<SimpleExpectationResultOutput> findTargetResult(@PathVariable String targetId,
      @PathVariable String injectId, @PathVariable String targetType) {
    return injectExpectationService.findExpectationsByInjectAndTargetAndTargetType(injectId, targetId, targetType)
        .stream()
        .map(expectation -> AtomicTestingMapper.toTargetResultDto(expectation, targetId))
        .toList();
  }

}
