package io.openbas.rest.asset.endpoint;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.EndpointSpecification.fromIds;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
import static io.openbas.helper.StreamHelper.iterableToSet;

import io.openbas.aop.LogExecutionTime;
import io.openbas.database.model.Agent;
import io.openbas.database.model.AssetAgentJob;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.AssetAgentJobRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.database.repository.ExecutorRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.specification.AssetAgentJobSpecification;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.asset.endpoint.form.EndpointOverviewOutput;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
import io.openbas.rest.asset.endpoint.form.EndpointUpdateInput;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.service.EndpointService;
import io.openbas.telemetry.Tracing;
import io.openbas.utils.EndpointMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class EndpointApi extends RestBehavior {

  public static final String ENDPOINT_URI = "/api/endpoints";

  @Value("${info.app.version:unknown}")
  String version;

  private final EndpointService endpointService;
  private final EndpointRepository endpointRepository;
  private final ExecutorRepository executorRepository;
  private final TagRepository tagRepository;
  private final AssetAgentJobRepository assetAgentJobRepository;

  private final EndpointMapper endpointMapper;

  @Secured(ROLE_ADMIN)
  @PostMapping(ENDPOINT_URI + "/register")
  @Transactional(rollbackFor = Exception.class)
  public Endpoint upsertEndpoint(@Valid @RequestBody final EndpointRegisterInput input)
      throws IOException {
    Optional<Endpoint> optionalEndpoint =
        this.endpointService.findByExternalReference(input.getExternalReference());
    Endpoint endpoint;
    if (optionalEndpoint.isPresent()) {
      endpoint = optionalEndpoint.get();
      endpoint.setIps(input.getIps());
      endpoint.setMacAddresses(input.getMacAddresses());
      endpoint.setHostname(input.getHostname());
      endpoint.setPlatform(input.getPlatform());
      endpoint.setArch(input.getArch());
      endpoint.setName(input.getName());
      endpoint.getAgents().getFirst().setVersion(input.getAgentVersion());
      endpoint.setDescription(input.getDescription());
      endpoint.getAgents().getFirst().setLastSeen(Instant.now());
      endpoint
          .getAgents()
          .getFirst()
          .setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
      endpoint
          .getAgents()
          .getFirst()
          .setPrivilege(input.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard);
      endpoint
          .getAgents()
          .getFirst()
          .setDeploymentMode(
              input.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session);
      endpoint.getAgents().getFirst().setExecutedByUser(input.getExecutedByUser());
    } else {
      endpoint = new Endpoint();
      Agent agent = new Agent();
      agent.setVersion(input.getAgentVersion());
      agent.setExternalReference(input.getExternalReference());
      endpoint.setUpdateAttributes(input);
      agent.setLastSeen(Instant.now());
      agent.setPrivilege(input.isElevated() ? Agent.PRIVILEGE.admin : Agent.PRIVILEGE.standard);
      agent.setDeploymentMode(
          input.isService() ? Agent.DEPLOYMENT_MODE.service : Agent.DEPLOYMENT_MODE.session);
      agent.setExecutedByUser(input.getExecutedByUser());
      endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
      agent.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
      agent.setAsset(endpoint);
      endpoint.setAgents(List.of(agent));
    }
    Endpoint updatedEndpoint = this.endpointService.updateEndpoint(endpoint);
    // If agent is not temporary and not the same version as the platform => Create an upgrade task
    // for the agent
    if (updatedEndpoint.getAgents().getFirst().getParent() == null
        && !updatedEndpoint.getAgents().getFirst().getVersion().equals(version)) {
      AssetAgentJob assetAgentJob = new AssetAgentJob();
      assetAgentJob.setCommand(
          this.endpointService.generateUpgradeCommand(updatedEndpoint.getPlatform().name()));
      assetAgentJob.setAgent(updatedEndpoint.getAgents().getFirst());
      assetAgentJobRepository.save(assetAgentJob);
    }
    return updatedEndpoint;
  }

  @LogExecutionTime
  @PostMapping(ENDPOINT_URI + "/jobs")
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

  @DeleteMapping(ENDPOINT_URI + "/jobs/{assetAgentJobId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public void cleanupAssetAgentJob(@PathVariable @NotBlank final String assetAgentJobId) {
    this.assetAgentJobRepository.deleteById(assetAgentJobId);
  }

  @LogExecutionTime
  @GetMapping(ENDPOINT_URI)
  @PreAuthorize("isObserver()")
  public List<Endpoint> endpoints() {
    return this.endpointService.endpoints(EndpointSpecification.findEndpointsForInjection());
  }

  @LogExecutionTime
  @GetMapping(ENDPOINT_URI + "/{endpointId}")
  @PreAuthorize("isPlanner()")
  @Tracing(name = "Endpoint overview", layer = "api", operation = "POST")
  public EndpointOverviewOutput endpoint(@PathVariable @NotBlank final String endpointId) {
    return endpointMapper.toEndpointOverviewOutput(this.endpointService.getEndpoint(endpointId));
  }

  @LogExecutionTime
  @PostMapping(ENDPOINT_URI + "/search")
  @Tracing(name = "Get a page of endpoints", layer = "api", operation = "POST")
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
  @Transactional(readOnly = true)
  @Tracing(name = "Find assets", layer = "api", operation = "POST")
  public List<Endpoint> findEndpoints(@RequestBody @Valid @NotNull final List<String> endpointIds) {
    return this.endpointRepository.findAll(fromIds(endpointIds));
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(ENDPOINT_URI + "/{endpointId}")
  @Transactional(rollbackFor = Exception.class)
  public EndpointOverviewOutput updateEndpoint(
      @PathVariable @NotBlank final String endpointId,
      @Valid @RequestBody final EndpointUpdateInput input) {
    return endpointMapper.toEndpointOverviewOutput(
        this.endpointService.updateEndpoint(endpointId, input));
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(ENDPOINT_URI + "/{endpointId}")
  @Transactional(rollbackFor = Exception.class)
  public void deleteEndpoint(@PathVariable @NotBlank final String endpointId) {
    this.endpointService.deleteEndpoint(endpointId);
  }
}
