package io.openbas.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Endpoint;
import io.openbas.rest.asset.form.AssetOutput;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@EqualsAndHashCode(callSuper = true)
@Data
@SuperBuilder
public class EndpointOutput extends AssetOutput {
  @NotNull
  @JsonProperty("endpoint_platform")
  private Endpoint.PLATFORM_TYPE platform;

  @NotNull
  @JsonProperty("endpoint_arch")
  private Endpoint.PLATFORM_ARCH arch;
}
