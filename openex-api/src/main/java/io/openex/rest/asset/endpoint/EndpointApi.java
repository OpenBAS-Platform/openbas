package io.openex.rest.asset.endpoint;

import io.openex.database.model.Endpoint;
import io.openex.rest.asset.endpoint.form.EndpointInput;
import io.openex.service.AssetEndpointService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;

@RequiredArgsConstructor
@RestController
public class EndpointApi {

  public static final String ENDPOINT_URI = "/api/endpoints";

  private final AssetEndpointService assetEndpointService;

  @PostMapping(ENDPOINT_URI)
  @RolesAllowed(ROLE_ADMIN)
  public Endpoint createEndpoint(@Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(Endpoint.PLATFORM_TYPE.valueOf(input.getPlatform()));
    return this.assetEndpointService.createEndpoint(endpoint);
  }

  @GetMapping(ENDPOINT_URI)
  @PreAuthorize("isObserver()")
  public List<Endpoint> endpoints() {
    return this.assetEndpointService.endpoints();
  }

  @PutMapping(ENDPOINT_URI + "/{endpointId}")
  @RolesAllowed(ROLE_ADMIN)
  public Endpoint updateEndpoint(
      @PathVariable @NotBlank final String endpointId,
      @Valid @RequestBody final EndpointInput input) {
    Endpoint endpoint = this.assetEndpointService.endpoint(endpointId);
    endpoint.setUpdateAttributes(input);
    endpoint.setPlatform(Endpoint.PLATFORM_TYPE.valueOf(input.getPlatform()));
    return this.assetEndpointService.updateEndpoint(endpoint);
  }

  @DeleteMapping(ENDPOINT_URI + "/{endpointId}")
  @RolesAllowed(ROLE_ADMIN)
  public void deleteEndpoint(@PathVariable @NotBlank final String endpointId) {
    this.assetEndpointService.deleteEndpoint(endpointId);
  }
}
