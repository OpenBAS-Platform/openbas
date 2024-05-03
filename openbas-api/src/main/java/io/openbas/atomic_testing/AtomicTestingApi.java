package io.openbas.atomic_testing;

import io.openbas.atomic_testing.form.*;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectStatus;
import io.openbas.inject_expectation.InjectExpectationService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.atomic_testing.AtomicTestingMapper.toDto;

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
  public Page<AtomicTestingOutput> findAllAtomicTestings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return this.atomicTestingService.findAllAtomicTestings(searchPaginationInput)
        .map(AtomicTestingMapper::toDto);
  }


  @GetMapping("/{injectId}")
  public AtomicTestingOutput findAtomicTesting(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId)
        .map(AtomicTestingMapper::toDtoWithTargetResults)
        .orElseThrow();
  }

  @Transactional
  @GetMapping("/{injectId}/detail")
  public AtomicTestingDetailOutput findAtomicTestingWithDetail(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId)
        .map(inject -> {
          Hibernate.initialize(inject.getTags());
          Hibernate.initialize(inject.getDocuments());
          Hibernate.initialize(inject.getExpectations());
          return AtomicTestingMapper.toDetailDto(inject);
        })
        .orElseThrow();
  }

  @GetMapping("/{injectId}/update")
  public Inject findAtomicTestingForUpdate(@PathVariable String injectId) {
    return atomicTestingService.findById(injectId).orElseThrow();
  }

  @PostMapping()
  public AtomicTestingOutput createAtomicTesting(@Valid @RequestBody AtomicTestingInput input) {
    Inject inject = this.atomicTestingService.createOrUpdate(input, null);
    return toDto(inject);
  }

  @PutMapping("/{injectId}")
  public AtomicTestingOutput updateAtomicTesting(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingInput input) {
    Inject inject = this.atomicTestingService.createOrUpdate(input, injectId);
    return toDto(inject);
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
  public List<InjectExpectation> findTargetResult(
      @PathVariable String targetId,
      @PathVariable String injectId,
      @PathVariable String targetType) {
    return injectExpectationService.findExpectationsByInjectAndTargetAndTargetType(injectId, targetId, targetType);
  }

  @PutMapping("/{injectId}/tags")
  public AtomicTestingOutput updateAtomicTestingTags(
      @PathVariable @NotBlank final String injectId,
      @Valid @RequestBody final AtomicTestingUpdateTagsInput input) {

    return AtomicTestingMapper.toDto(atomicTestingService.updateAtomicTestingTags(injectId, input));
  }


}
