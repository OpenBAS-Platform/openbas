package io.openex.rest.asset.endpoint;

import io.openex.database.model.Endpoint;
import io.openex.database.repository.TagRepository;
import io.openex.rest.asset.endpoint.form.EndpointInput;
import io.openex.service.AssetEndpointService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

import static io.openex.database.model.Asset.MANUAL_SOURCE;
import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.StreamHelper.fromIterable;
import static org.springframework.util.StringUtils.hasText;

@RequiredArgsConstructor
@RestController
public class EndpointApi {

  public static final String ENDPOINT_URI = "/api/endpoints";

  private final AssetEndpointService assetEndpointService;
  private final TagRepository tagRepository;

  @PostMapping(ENDPOINT_URI)
  @Secured(ROLE_ADMIN)
  public Endpoint createEndpoint(@Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));
    // Set source to manual by API
    Map<String, String> sources = endpoint.getSources();
    sources.put(MANUAL_SOURCE, "manual");
    endpoint.setSources(sources);

    return this.assetEndpointService.createEndpoint(endpoint);
  }

  @GetMapping(ENDPOINT_URI)
  @PreAuthorize("isObserver()")
  public List<Endpoint> endpoints() {
    return this.assetEndpointService.endpoints();
  }

  @PutMapping(ENDPOINT_URI + "/{endpointId}")
  @Secured(ROLE_ADMIN)
  public Endpoint updateEndpoint(
      @PathVariable @NotBlank final String endpointId,
      @Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = this.assetEndpointService.endpoint(endpointId);
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(input.getPlatform());
    endpoint.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));
    // Set source to manual by API
    Map<String, String> sources = endpoint.getSources();
    if (!hasText(sources.get(MANUAL_SOURCE)))
      sources.put(MANUAL_SOURCE, "manual");
    endpoint.setSources(sources);

    return this.assetEndpointService.updateEndpoint(endpoint);
  }

  @DeleteMapping(ENDPOINT_URI + "/{endpointId}")
  @Secured(ROLE_ADMIN)
  public void deleteEndpoint(@PathVariable @NotBlank final String endpointId) {
    this.assetEndpointService.deleteEndpoint(endpointId);
  }
}
