package io.openbas.rest.asset.endpoint;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.fromIterable;

import io.openbas.aop.LogExecutionTime;
import io.openbas.aop.RBAC;
import io.openbas.database.model.*;
import io.openbas.database.repository.AssetAgentJobRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.database.specification.AssetAgentJobSpecification;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.rest.asset.endpoint.form.*;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.EndpointService;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.HttpReqRespUtils;
import io.openbas.utils.mapper.EndpointMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class EndpointApi extends RestBehavior {

  public static final String ENDPOINT_URI = "/api/endpoints";

  private final EndpointService endpointService;
  private final EndpointRepository endpointRepository;
  private final AssetAgentJobRepository assetAgentJobRepository;

  private final EndpointMapper endpointMapper;

  @PostMapping(ENDPOINT_URI + "/agentless")
  @RBAC(actionPerformed = Action.CREATE, resourceType = ResourceType.ASSET)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public Endpoint createEndpoint(@Valid @RequestBody final EndpointInput input) {
    return this.endpointService.createEndpoint(input);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(ENDPOINT_URI + "/register")
  @RBAC(actionPerformed = Action.CREATE, resourceType = ResourceType.ASSET)
  @Transactional(rollbackFor = Exception.class)
  public Endpoint upsertEndpoint(@Valid @RequestBody final EndpointRegisterInput input)
      throws IOException {
    input.setSeenIp(HttpReqRespUtils.getClientIpAddressIfServletRequestExist());
    return this.endpointService.register(input);
  }

  @LogExecutionTime
  @PostMapping(ENDPOINT_URI + "/jobs")
  @RBAC(actionPerformed = Action.READ, resourceType = ResourceType.ASSET)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public List<AssetAgentJob> getEndpointJobs(@RequestBody final EndpointRegisterInput input) {
    return this.assetAgentJobRepository.findAll(
        AssetAgentJobSpecification.forEndpoint(
            input.getExternalReference(),
            input.isService()
                ? Agent.DEPLOYMENT_MODE.service.name()
                : Agent.DEPLOYMENT_MODE.session.name(),
            input.isElevated() ? Agent.PRIVILEGE.admin.name() : Agent.PRIVILEGE.standard.name(),
            input.getExecutedByUser()));
  }

  @Deprecated(since = "1.11.0")
  @LogExecutionTime
  @GetMapping(ENDPOINT_URI + "/jobs/{endpointExternalReference}")
  @RBAC(actionPerformed = Action.READ, resourceType = ResourceType.ASSET)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public List<AssetAgentJob> getEndpointJobs(
      @PathVariable @NotBlank final String endpointExternalReference) {
    return this.assetAgentJobRepository.findAll(
        AssetAgentJobSpecification.forEndpoint(endpointExternalReference));
  }

  @DeleteMapping(ENDPOINT_URI + "/jobs/{assetAgentJobId}")
  @RBAC(actionPerformed = Action.WRITE, resourceType = ResourceType.JOB)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public void cleanupAssetAgentJob(@PathVariable @NotBlank final String assetAgentJobId) {
    this.assetAgentJobRepository.deleteById(assetAgentJobId);
  }

  @Deprecated(since = "1.11.0")
  @PostMapping(ENDPOINT_URI + "/jobs/{assetAgentJobId}")
  @RBAC(actionPerformed = Action.WRITE, resourceType = ResourceType.JOB)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public void cleanupAssetAgentJobDepreacted(@PathVariable @NotBlank final String assetAgentJobId) {
    this.assetAgentJobRepository.deleteById(assetAgentJobId);
  }

  @LogExecutionTime
  @GetMapping(ENDPOINT_URI)
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.ASSET)
  @PreAuthorize("isObserver()")
  public List<Endpoint> endpoints() {
    return this.endpointService.endpoints(
        EndpointSpecification.findEndpointsForInjectionOrAgentlessEndpoints());
  }

  @LogExecutionTime
  @GetMapping(ENDPOINT_URI + "/{endpointId}")
  @RBAC(
      resourceId = "#endpointId",
      actionPerformed = Action.READ,
      resourceType = ResourceType.ASSET)
  @PreAuthorize("isPlanner()")
  public EndpointOverviewOutput endpoint(@PathVariable @NotBlank final String endpointId) {
    return endpointMapper.toEndpointOverviewOutput(this.endpointService.getEndpoint(endpointId));
  }

  @LogExecutionTime
  @PostMapping(ENDPOINT_URI + "/search")
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.ASSET)
  public Page<EndpointOutput> endpoints(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    Page<Endpoint> endpointPage = endpointService.searchEndpoints(searchPaginationInput);
    // Convert the Page of Endpoint to a Page of EndpointOutput
    List<EndpointOutput> endpointOutputs =
        endpointPage.getContent().stream().map(endpointMapper::toEndpointOutput).toList();
    return new PageImpl<>(
        endpointOutputs, endpointPage.getPageable(), endpointPage.getTotalElements());
  }

  @LogExecutionTime
  @PostMapping(ENDPOINT_URI + "/find")
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.ASSET)
  @Transactional(readOnly = true)
  public List<Endpoint> findEndpoints(@RequestBody @Valid @NotNull final List<String> endpointIds) {
    return this.endpointService.endpoints(endpointIds);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(ENDPOINT_URI + "/{endpointId}")
  @RBAC(
      resourceId = "#endpointId",
      actionPerformed = Action.WRITE,
      resourceType = ResourceType.ASSET)
  @Transactional(rollbackFor = Exception.class)
  public EndpointOverviewOutput updateEndpoint(
      @PathVariable @NotBlank final String endpointId,
      @Valid @RequestBody final EndpointInput input) {
    return endpointMapper.toEndpointOverviewOutput(
        this.endpointService.updateEndpoint(endpointId, input));
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(ENDPOINT_URI + "/{endpointId}")
  @RBAC(
      resourceId = "#endpointId",
      actionPerformed = Action.DELETE,
      resourceType = ResourceType.ASSET)
  @Transactional(rollbackFor = Exception.class)
  public void deleteEndpoint(@PathVariable @NotBlank final String endpointId) {
    this.endpointService.deleteEndpoint(endpointId);
  }

  // -- OPTION --

  @GetMapping(ENDPOINT_URI + "/options")
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.ASSET)
  public List<FilterUtilsJpa.Option> optionsByName(
      @RequestParam(required = false) final String searchText,
      @RequestParam(required = false) final String simulationOrScenarioId) {
    return endpointRepository
        .findAllBySimulationOrScenarioIdAndName(
            StringUtils.trimToNull(simulationOrScenarioId), StringUtils.trimToNull(searchText))
        .stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }

  @LogExecutionTime
  @GetMapping(ENDPOINT_URI + "/findings/options")
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.ASSET)
  public List<FilterUtilsJpa.Option> optionsByNameLinkedToFindings(
      @RequestParam(required = false) final String searchText,
      @RequestParam(required = false) final String sourceId) {
    return endpointService.getOptionsByNameLinkedToFindings(
        searchText, sourceId, PageRequest.of(0, 50));
  }

  @PostMapping(ENDPOINT_URI + "/options")
  @RBAC(actionPerformed = Action.SEARCH, resourceType = ResourceType.ASSET)
  public List<FilterUtilsJpa.Option> optionsById(@RequestBody final List<String> ids) {
    return fromIterable(this.endpointRepository.findAllById(ids)).stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }
}
