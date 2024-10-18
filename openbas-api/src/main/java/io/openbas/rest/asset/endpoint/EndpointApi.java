package io.openbas.rest.asset.endpoint;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.EndpointSpecification.fromIds;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
import static io.openbas.helper.StreamHelper.iterableToSet;

import io.openbas.aop.LogExecutionTime;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.AssetAgentJob;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.AssetAgentJobRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.database.repository.ExecutorRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.specification.AssetAgentJobSpecification;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
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
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class EndpointApi {

  public static final String ENDPOINT_URI = "/api/endpoints";

  @Value("${info.app.version:unknown}")
  String version;

  private final EndpointService endpointService;
  private final EndpointCriteriaBuilderService endpointCriteriaBuilderService;
  private final EndpointRepository endpointRepository;
  private final ExecutorRepository executorRepository;
  private final TagRepository tagRepository;
  private final AssetAgentJobRepository assetAgentJobRepository;

  @PostMapping(ENDPOINT_URI)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public Endpoint createEndpoint(@Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setArch(input.getArch());
    endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.endpointService.createEndpoint(endpoint);
  }

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
      endpoint.setAgentVersion(input.getAgentVersion());
      endpoint.setDescription(input.getDescription());
      endpoint.setLastSeen(Instant.now());
      endpoint.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
    } else {
      endpoint = new Endpoint();
      endpoint.setUpdateAttributes(input);
      endpoint.setLastSeen(Instant.now());
      endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
      endpoint.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
    }
    Endpoint updatedEndpoint = this.endpointService.updateEndpoint(endpoint);
    // If agent is not temporary and not the same version as the platform => Create an upgrade task
    // for the agent
    if (updatedEndpoint.getParent() == null && !updatedEndpoint.getAgentVersion().equals(version)) {
      AssetAgentJob assetAgentJob = new AssetAgentJob();
      assetAgentJob.setCommand(
          this.endpointService.generateUpgradeCommand(updatedEndpoint.getPlatform().name()));
      assetAgentJob.setAsset(updatedEndpoint);
      assetAgentJobRepository.save(assetAgentJob);
    }
    return updatedEndpoint;
  }

  @GetMapping(ENDPOINT_URI + "/jobs/{endpointExternalReference}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public List<AssetAgentJob> getEndpointJobs(
      @PathVariable @NotBlank final String endpointExternalReference) {
    return this.assetAgentJobRepository.findAll(
        AssetAgentJobSpecification.forEndpoint(endpointExternalReference));
  }

  @PostMapping(ENDPOINT_URI + "/jobs/{assetAgentJobId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public void cleanupAssetAgentJob(@PathVariable @NotBlank final String assetAgentJobId) {
    this.assetAgentJobRepository.deleteById(assetAgentJobId);
  }

  @GetMapping(ENDPOINT_URI)
  @PreAuthorize("isObserver()")
  public List<Endpoint> endpoints() {
    return this.endpointService.endpoints(EndpointSpecification.findEndpointsForInjection());
  }

  @GetMapping(ENDPOINT_URI + "/{endpointId}")
  @PreAuthorize("isPlanner()")
  public Endpoint endpoint(@PathVariable @NotBlank final String endpointId) {
    return this.endpointService.endpoint(endpointId);
  }

  @LogExecutionTime
  @PostMapping(ENDPOINT_URI + "/search")
  public Page<EndpointOutput> endpoints(
      @RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return this.endpointCriteriaBuilderService.endpointPagination(searchPaginationInput);
  }

  @PostMapping(ENDPOINT_URI + "/find")
  @PreAuthorize("isPlanner()")
  @Transactional(readOnly = true)
  public List<EndpointOutput> findEndpoints(
      @RequestBody @Valid @NotNull final List<String> endpointIds) {
    return this.endpointCriteriaBuilderService.find(fromIds(endpointIds));
  }

  @PutMapping(ENDPOINT_URI + "/{endpointId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public Endpoint updateEndpoint(
      @PathVariable @NotBlank final String endpointId,
      @Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = this.endpointService.endpoint(endpointId);
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setArch(input.getArch());
    endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.endpointService.updateEndpoint(endpoint);
  }

  @DeleteMapping(ENDPOINT_URI + "/{endpointId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackFor = Exception.class)
  public void deleteEndpoint(@PathVariable @NotBlank final String endpointId) {
    this.endpointService.deleteEndpoint(endpointId);
  }
}
