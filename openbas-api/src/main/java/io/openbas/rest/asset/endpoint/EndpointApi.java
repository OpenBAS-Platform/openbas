package io.openbas.rest.asset.endpoint;

import io.openbas.asset.EndpointService;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.database.specification.EndpointSpecification;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RequiredArgsConstructor
@RestController
@Secured(ROLE_USER)
public class EndpointApi {

  public static final String  ENDPOINT_URI = "/api/endpoints";

  private final EndpointService endpointService;
  private final EndpointRepository endpointRepository;
  private final TagRepository tagRepository;

  @PostMapping(ENDPOINT_URI)
  @PreAuthorize("isPlanner()")
  public Endpoint createEndpoint(@Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));
    return this.endpointService.createEndpoint(endpoint);
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
  public Endpoint updateEndpoint(
      @PathVariable @NotBlank final String endpointId,
      @Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = this.endpointService.endpoint(endpointId);
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));
    return this.endpointService.updateEndpoint(endpoint);
  }

  @DeleteMapping(ENDPOINT_URI + "/{endpointId}")
  @PreAuthorize("isPlanner()")
  public void deleteEndpoint(@PathVariable @NotBlank final String endpointId) {
    this.endpointService.deleteEndpoint(endpointId);
  }
}
