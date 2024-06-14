package io.openbas.rest.atomic_testing;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.inject_expectation.InjectExpectationService;
import io.openbas.rest.atomic_testing.form.AtomicTestingInput;
import io.openbas.rest.atomic_testing.form.AtomicTestingUpdateTagsInput;
import io.openbas.rest.atomic_testing.form.InjectResultDTO;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.inject.output.AtomicTestingOutput;
import io.openbas.service.AtomicTestingService;
import io.openbas.utils.AtomicTestingMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.utils.AtomicTestingUtils.getTargets;

@RestController
@RequestMapping("/api/atomic_testings")
@PreAuthorize("isAdmin()")
@RequiredArgsConstructor
public class AtomicTestingApi extends RestBehavior {

  private final AtomicTestingService atomicTestingService;
  private final InjectExpectationService injectExpectationService;

  @PostMapping("/search")
  @LogExecutionTime
  @Transactional(readOnly = true)
  public Page<AtomicTestingOutput> findAllAtomicTestings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return this.atomicTestingService.findAllAtomicTestings(searchPaginationInput);
  }

  @GetMapping("/{injectId}")
  public InjectResultDTO findAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId)
        .map(AtomicTestingMapper::toDtoWithTargetResults)
        .orElseThrow(ElementNotFoundException::new);
  }

  @PostMapping()
  @Transactional(rollbackFor = Exception.class)
  public InjectResultDTO createAtomicTesting(@Valid @RequestBody AtomicTestingInput input) {
    Inject inject = this.atomicTestingService.createOrUpdate(input, null);
    return AtomicTestingMapper.toDto(
        inject, getTargets(
            inject.getTeams(),
            inject.getAssets(),
            inject.getAssetGroups()
        )
    );
  }

  @PutMapping("/{injectId}")
  @Transactional(rollbackFor = Exception.class)
  public InjectResultDTO updateAtomicTesting(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingInput input) {
    Inject inject = this.atomicTestingService.createOrUpdate(input, injectId);
    return AtomicTestingMapper.toDto(
        inject, getTargets(
            inject.getTeams(),
            inject.getAssets(),
            inject.getAssetGroups()
        )
    );
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
      @PathVariable String targetId,
      @PathVariable String injectId,
      @PathVariable String targetType) {
    return injectExpectationService.findExpectationsByInjectAndTargetAndTargetType(injectId, targetId, targetType);
  }

  @PutMapping("/{injectId}/tags")
  @Transactional(rollbackFor = Exception.class)
  public InjectResultDTO updateAtomicTestingTags(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingUpdateTagsInput input) {
    Inject inject = atomicTestingService.updateAtomicTestingTags(injectId, input);
    return AtomicTestingMapper.toDto(
        inject, getTargets(
            inject.getTeams(),
            inject.getAssets(),
            inject.getAssetGroups()
        )
    );
  }


}
