package io.openbas.rest.asset.endpoint;

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
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.executors.openbas.OpenBASExecutor.OPENBAS_EXECUTOR_ID;
import static io.openbas.helper.StreamHelper.iterableToSet;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class EndpointApi {

  public static final String  ENDPOINT_URI = "/api/endpoints";

  private final EndpointService endpointService;
  private final EndpointRepository endpointRepository;
  private final ExecutorRepository executorRepository;
  private final TagRepository tagRepository;
  private final AssetAgentJobRepository assetAgentJobRepository;

  @PostMapping(ENDPOINT_URI)
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Endpoint createEndpoint(@Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.endpointService.createEndpoint(endpoint);
  }

  @PostMapping(ENDPOINT_URI + "/register")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Endpoint upsertEndpoint(@Valid @RequestBody final EndpointRegisterInput input) {
    Optional<Endpoint> optionalEndpoint = this.endpointService.findByExternalReference(input.getExternalReference());
    if (optionalEndpoint.isPresent()) {
      Endpoint endpoint = optionalEndpoint.get();
      endpoint.setIps(input.getIps());
      endpoint.setMacAddresses(input.getMacAddresses());
      endpoint.setHostname(input.getHostname());
      endpoint.setPlatform(input.getPlatform());
      endpoint.setName(input.getName());
      endpoint.setDescription(input.getDescription());
      endpoint.setLastSeen(Instant.now());
      endpoint.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
      return this.endpointService.updateEndpoint(endpoint);
    } else {
      Endpoint endpoint = new Endpoint();
      endpoint.setUpdateAttributes(input);
      endpoint.setIps(input.getIps());
      endpoint.setPlatform(input.getPlatform());
      endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
      endpoint.setExecutor(executorRepository.findById(OPENBAS_EXECUTOR_ID).orElse(null));
      return this.endpointService.createEndpoint(endpoint);
    }
  }

  @GetMapping(ENDPOINT_URI + "/jobs/{endpointExternalReference}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public List<AssetAgentJob> getEndpointJobs(@PathVariable @NotBlank final String endpointExternalReference) {
    return this.assetAgentJobRepository.findAll(AssetAgentJobSpecification.forEndpoint(endpointExternalReference));
  }

  @PostMapping(ENDPOINT_URI + "/jobs/{assetAgentJobId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
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

  @PostMapping(ENDPOINT_URI + "/search")
  public Page<Endpoint> endpoints(@RequestBody @Valid SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Endpoint> specification, Pageable pageable) -> this.endpointRepository.findAll(
                    EndpointSpecification.findEndpointsForInjection().and(specification),
                    pageable
            ),
            searchPaginationInput,
            Endpoint.class
    );
  }

  @PutMapping(ENDPOINT_URI + "/{endpointId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public Endpoint updateEndpoint(
      @PathVariable @NotBlank final String endpointId,
      @Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = this.endpointService.endpoint(endpointId);
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setTags(iterableToSet(this.tagRepository.findAllById(input.getTagIds())));
    return this.endpointService.updateEndpoint(endpoint);
  }

  @DeleteMapping(ENDPOINT_URI + "/{endpointId}")
  @PreAuthorize("isPlanner()")
  @Transactional(rollbackOn = Exception.class)
  public void deleteEndpoint(@PathVariable @NotBlank final String endpointId) {
    this.endpointService.deleteEndpoint(endpointId);
  }
}
