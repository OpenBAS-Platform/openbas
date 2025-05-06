package io.openbas.rest.finding;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Finding;
import io.openbas.database.repository.FindingRepository;
import io.openbas.database.specification.FindingSpecification;
import io.openbas.rest.finding.form.FindingInput;
import io.openbas.rest.finding.form.FindingOutput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.FindingMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/findings")
@RequiredArgsConstructor
public class FindingApi extends RestBehavior {

  private final FindingRepository findingRepository;

  private final FindingService findingService;
  private final FindingMapper findingMapper;

  // -- CRUD --

  @LogExecutionTime
  @PostMapping("/search")
  @PreAuthorize("isObserver()")
  public Page<FindingOutput> findings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(this.findingRepository::findAll, searchPaginationInput, Finding.class)
        .map(findingMapper::toFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/injects/{injectId}/search")
  @PreAuthorize("isObserver()")
  public Page<FindingOutput> findingsByInject(
      @PathVariable @NotNull final String injectId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForInject(injectId).and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/exercises/{simulationId}/search")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Page<FindingOutput> findingsBySimulation(
      @PathVariable @NotNull final String simulationId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForSimulation(simulationId).and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/scenarios/{scenarioId}/search")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Page<FindingOutput> findingsByScenario(
      @PathVariable @NotNull final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForScenario(scenarioId).and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/endpoints/{endpointId}/search")
  @PreAuthorize("isObserver()")
  public Page<FindingOutput> findingsByEndpoint(
      @PathVariable @NotNull final String endpointId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForEndpoint(endpointId).and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toFindingOutput);
  }

  @GetMapping("/{id}")
  @PreAuthorize("isObserver()")
  public ResponseEntity<Finding> finding(@PathVariable @NotNull final String id) {
    return ResponseEntity.ok(this.findingService.finding(id));
  }

  @PostMapping
  @PreAuthorize("isPlanner()")
  public ResponseEntity<Finding> createFinding(
      @RequestBody @Valid @NotNull final FindingInput input) {
    return ResponseEntity.ok(
        this.findingService.createFinding(input.toFinding(new Finding()), input.getInjectId()));
  }

  @PutMapping("/{id}")
  @PreAuthorize("isPlanner()")
  public ResponseEntity<Finding> updateFinding(
      @PathVariable @NotNull final String id,
      @RequestBody @Valid @NotNull final FindingInput input) {
    Finding existingFinding = this.findingService.finding(id);
    Finding updatedFinding = input.toFinding(existingFinding);
    return ResponseEntity.ok(
        this.findingService.updateFinding(updatedFinding, input.getInjectId()));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("isPlanner()")
  public ResponseEntity<Void> deleteFinding(@PathVariable @NotNull final String id) {
    this.findingService.deleteFinding(id);
    return ResponseEntity.noContent().build();
  }
}
