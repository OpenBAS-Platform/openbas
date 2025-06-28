package io.openbas.rest.finding;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Asset;
import io.openbas.database.model.ContractOutputType;
import io.openbas.database.model.Finding;
import io.openbas.database.model.TypeValueKey;
import io.openbas.database.repository.FindingRepository;
import io.openbas.database.specification.FindingSpecification;
import io.openbas.rest.finding.form.AggregatedFindingOutput;
import io.openbas.rest.finding.form.FindingInput;
import io.openbas.rest.finding.form.RelatedFindingOutput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.FindingMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
  public Page<RelatedFindingOutput> findings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (specification, pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.forLatestSimulations().and(specification), pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toRelatedFindingOutput);
  }

  @PostMapping("/search/distinct")
  public Page<AggregatedFindingOutput> searchDistinctFindings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {

    // Step 1: Get page of unique findings (one per type+value)
    Page<Finding> page =
        buildPaginationJPA(
            (specification, pageable) ->
                findingRepository.findAll(
                    FindingSpecification.distinctTypeValueWithFilter(
                        FindingSpecification.forLatestSimulations().and(specification)),
                    pageable),
            searchPaginationInput,
            Finding.class);

    // Step 2: Extract distinct (type, value) keys
    List<TypeValueKey> typeValueKeys =
        page.getContent().stream()
            .map(f -> new TypeValueKey(f.getType(), f.getValue()))
            .distinct()
            .toList();

    // Step 3: Batch fetch all findings + assets for these keys
    List<ContractOutputType> types =
        typeValueKeys.stream().map(TypeValueKey::getType).distinct().toList();

    List<String> values = typeValueKeys.stream().map(TypeValueKey::getValue).distinct().toList();

    // Step 3: Fetch all findings with assets for those values/types
    List<Finding> findingsWithAssets =
        findingRepository.findAllWithAssetsByTypeValueIn(types, values);

    // Step 4: Group assets by (type, value)
    Map<TypeValueKey, List<Asset>> groupedAssets =
        findingsWithAssets.stream()
            .filter(f -> typeValueKeys.contains(new TypeValueKey(f.getType(), f.getValue())))
            .flatMap(
                f ->
                    f.getAssets().stream()
                        .map(
                            asset -> Map.entry(new TypeValueKey(f.getType(), f.getValue()), asset)))
            .collect(
                Collectors.groupingBy(
                    Map.Entry::getKey,
                    Collectors.mapping(Map.Entry::getValue, Collectors.toList())));

    // Step 5: Map page findings + grouped assets to DTO
    return page.map(
        finding -> {
          TypeValueKey key = new TypeValueKey(finding.getType(), finding.getValue());
          List<Asset> relatedAssets = groupedAssets.getOrDefault(key, List.of());
          return findingMapper.toAggregatedFindingOutput(finding, relatedAssets);
        });
  }

  @LogExecutionTime
  @PostMapping("/injects/{injectId}/search")
  @PreAuthorize("isObserver()")
  public Page<RelatedFindingOutput> findingsByInject(
      @PathVariable @NotNull final String injectId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForInject(injectId).and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toRelatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/injects/{injectId}/search/distinct")
  @PreAuthorize("isObserver()")
  public Page<AggregatedFindingOutput> searchDistinctFindingsByInject(
      @PathVariable @NotNull final String injectId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.distinctTypeValueWithFilter(
                        FindingSpecification.findFindingsForInject(injectId).and(specification)),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toAggregatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/exercises/{simulationId}/search")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Page<RelatedFindingOutput> findingsBySimulation(
      @PathVariable @NotNull final String simulationId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForSimulation(simulationId).and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toRelatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/exercises/{simulationId}/search/distinct")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Page<AggregatedFindingOutput> searchDistinctFindingsBySimulation(
      @PathVariable @NotNull final String simulationId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.distinctTypeValueWithFilter(
                        FindingSpecification.findFindingsForSimulation(simulationId)
                            .and(specification)),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toAggregatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/scenarios/{scenarioId}/search")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Page<RelatedFindingOutput> findingsByScenario(
      @PathVariable @NotNull final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForScenario(scenarioId)
                        .and(FindingSpecification.forLatestSimulations())
                        .and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toRelatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/scenarios/{scenarioId}/search/distinct")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Page<AggregatedFindingOutput> searchDistinctFindingsByScenario(
      @PathVariable @NotNull final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.distinctTypeValueWithFilter(
                        FindingSpecification.findFindingsForScenario(scenarioId)
                            .and(FindingSpecification.forLatestSimulations())
                            .and(specification)),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toAggregatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/endpoints/{endpointId}/search")
  @PreAuthorize("isObserver()")
  public Page<RelatedFindingOutput> findingsByEndpoint(
      @PathVariable @NotNull final String endpointId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.findFindingsForEndpoint(endpointId)
                        .and(FindingSpecification.forLatestSimulations())
                        .and(specification),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toRelatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/endpoints/{endpointId}/search/distinct")
  @PreAuthorize("isObserver()")
  public Page<AggregatedFindingOutput> searchDistinctFindingsByEndpoint(
      @PathVariable @NotNull final String endpointId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Finding> specification, Pageable pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.distinctTypeValueWithFilter(
                        FindingSpecification.findFindingsForEndpoint(endpointId)
                            .and(FindingSpecification.forLatestSimulations())
                            .and(specification)),
                    pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toAggregatedFindingOutput);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Finding> finding(@PathVariable @NotNull final String id) {
    return ResponseEntity.ok(this.findingService.finding(id));
  }

  @PostMapping
  public ResponseEntity<Finding> createFinding(
      @RequestBody @Valid @NotNull final FindingInput input) {
    return ResponseEntity.ok(
        this.findingService.createFinding(input.toFinding(new Finding()), input.getInjectId()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Finding> updateFinding(
      @PathVariable @NotNull final String id,
      @RequestBody @Valid @NotNull final FindingInput input) {
    Finding existingFinding = this.findingService.finding(id);
    Finding updatedFinding = input.toFinding(existingFinding);
    return ResponseEntity.ok(
        this.findingService.updateFinding(updatedFinding, input.getInjectId()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteFinding(@PathVariable @NotNull final String id) {
    this.findingService.deleteFinding(id);
    return ResponseEntity.noContent().build();
  }
}
