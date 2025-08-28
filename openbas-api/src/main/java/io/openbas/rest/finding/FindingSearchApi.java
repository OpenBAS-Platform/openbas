package io.openbas.rest.finding;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.aop.LogExecutionTime;
import io.openbas.aop.RBAC;
import io.openbas.database.model.Action;
import io.openbas.database.model.Finding;
import io.openbas.database.model.ResourceType;
import io.openbas.database.repository.FindingRepository;
import io.openbas.database.specification.FindingSpecification;
import io.openbas.rest.finding.form.AggregatedFindingOutput;
import io.openbas.rest.finding.form.PageAggregatedFindingOutput;
import io.openbas.rest.finding.form.PageRelatedFindingOutput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.mapper.FindingMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(FindingApi.FINDING_URI)
@RequiredArgsConstructor
public class FindingSearchApi extends RestBehavior {

  private final FindingRepository findingRepository;
  private final FindingDistinctSearchService findingDistinctSearchService;

  private final FindingMapper findingMapper;

  @LogExecutionTime
  @PostMapping("/search")
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.FINDING)
  @ApiResponse(
      responseCode = "200",
      content =
          @Content(
              schema =
                  @Schema(
                      oneOf = {PageAggregatedFindingOutput.class, PageRelatedFindingOutput.class})))
  public Page<AggregatedFindingOutput> findings(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput,
      @RequestParam(value = "distinct", required = false, defaultValue = "false")
          boolean distinct) {
    if (distinct) {
      return findingDistinctSearchService.searchDistinctFindings(searchPaginationInput);
    }
    return buildPaginationJPA(
            (specification, pageable) ->
                this.findingRepository.findAll(
                    FindingSpecification.forLatestSimulations().and(specification), pageable),
            searchPaginationInput,
            Finding.class)
        .map(findingMapper::toRelatedFindingOutput);
  }

  @LogExecutionTime
  @PostMapping("/injects/{injectId}/search")
  @RBAC(resourceId = "#injectId", actionPerformed = Action.READ, resourceType = ResourceType.INJECT)
  @ApiResponse(
      responseCode = "200",
      content =
          @Content(
              schema =
                  @Schema(
                      oneOf = {PageAggregatedFindingOutput.class, PageRelatedFindingOutput.class})))
  public Page<AggregatedFindingOutput> findingsByInject(
      @PathVariable @NotNull final String injectId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput,
      @RequestParam(value = "distinct", required = false, defaultValue = "false")
          boolean distinct) {
    if (distinct) {
      return findingDistinctSearchService.searchDistinctFindingsByInject(
          injectId, searchPaginationInput);
    }
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
  @PostMapping("/exercises/{simulationId}/search")
  @RBAC(
      resourceId = "#simulationId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.SIMULATION)
  @ApiResponse(
      responseCode = "200",
      content =
          @Content(
              schema =
                  @Schema(
                      oneOf = {PageAggregatedFindingOutput.class, PageRelatedFindingOutput.class})))
  public Page<AggregatedFindingOutput> findingsBySimulation(
      @PathVariable @NotNull final String simulationId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput,
      @RequestParam(value = "distinct", required = false, defaultValue = "false")
          boolean distinct) {
    if (distinct) {
      return findingDistinctSearchService.searchDistinctFindingsBySimulation(
          simulationId, searchPaginationInput);
    }
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
  @PostMapping("/scenarios/{scenarioId}/search")
  @RBAC(
      resourceId = "#scenarioId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.SCENARIO)
  @ApiResponse(
      responseCode = "200",
      content =
          @Content(
              schema =
                  @Schema(
                      oneOf = {PageAggregatedFindingOutput.class, PageRelatedFindingOutput.class})))
  public Page<AggregatedFindingOutput> findingsByScenario(
      @PathVariable @NotNull final String scenarioId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput,
      @RequestParam(value = "distinct", required = false, defaultValue = "false")
          boolean distinct) {
    if (distinct) {
      return findingDistinctSearchService.searchDistinctFindingsByScenario(
          scenarioId, searchPaginationInput);
    }
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
  @PostMapping("/endpoints/{endpointId}/search")
  @RBAC(
      resourceId = "#endpointId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.ASSET)
  @ApiResponse(
      responseCode = "200",
      content =
          @Content(
              schema =
                  @Schema(
                      oneOf = {PageAggregatedFindingOutput.class, PageRelatedFindingOutput.class})))
  public Page<AggregatedFindingOutput> findingsByEndpoint(
      @PathVariable @NotNull final String endpointId,
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput,
      @RequestParam(value = "distinct", required = false, defaultValue = "false")
          boolean distinct) {
    if (distinct) {
      return findingDistinctSearchService.searchDistinctFindingsByEndpoint(
          endpointId, searchPaginationInput);
    }
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
}
