package io.openbas.rest.finding;

import io.openbas.aop.LogExecutionTime;
import io.openbas.rest.finding.form.AggregatedFindingOutput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(FindingApi.FINDING_URI)
@RequiredArgsConstructor
public class FindingSearchDistinctApi extends RestBehavior {

  private final FindingDistinctSearchService findingDistinctSearchService;

  @PostMapping("/search/distinct")
  public Page<AggregatedFindingOutput> searchDistinctFindings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return findingDistinctSearchService.searchDistinctFindings(searchPaginationInput);
  }

  @LogExecutionTime
  @PostMapping("/injects/{injectId}/search/distinct")
  @PreAuthorize("isObserver()")
  public Page<AggregatedFindingOutput> searchDistinctFindingsByInject(
      @PathVariable @NotNull final String injectId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return findingDistinctSearchService.searchDistinctFindingsByInject(
        injectId, searchPaginationInput);
  }

  @LogExecutionTime
  @PostMapping("/exercises/{simulationId}/search/distinct")
  @PreAuthorize("isExerciseObserver(#exerciseId)")
  public Page<AggregatedFindingOutput> searchDistinctFindingsBySimulation(
      @PathVariable @NotNull final String simulationId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return findingDistinctSearchService.searchDistinctFindingsBySimulation(
        simulationId, searchPaginationInput);
  }

  @LogExecutionTime
  @PostMapping("/scenarios/{scenarioId}/search/distinct")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Page<AggregatedFindingOutput> searchDistinctFindingsByScenario(
      @PathVariable @NotNull final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return findingDistinctSearchService.searchDistinctFindingsByScenario(
        scenarioId, searchPaginationInput);
  }

  @LogExecutionTime
  @PostMapping("/endpoints/{endpointId}/search/distinct")
  @PreAuthorize("isObserver()")
  public Page<AggregatedFindingOutput> searchDistinctFindingsByEndpoint(
      @PathVariable @NotNull final String endpointId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return findingDistinctSearchService.searchDistinctFindingsByEndpoint(
        endpointId, searchPaginationInput);
  }
}
