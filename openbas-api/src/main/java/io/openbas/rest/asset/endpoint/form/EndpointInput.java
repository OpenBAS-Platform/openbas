package io.openbas.rest.asset.endpoint.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Endpoint;
import io.openbas.rest.asset.form.AssetInput;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class EndpointInput extends AssetInput {

  @NotEmpty(message = MANDATORY_MESSAGE)
  @Size(min = 1, message = MANDATORY_MESSAGE)
  @JsonProperty("endpoint_ips")
  private String[] ips;

  @JsonProperty("endpoint_hostname")
  private String hostname;

  @JsonProperty("endpoint_agent_version")
  private String agentVersion;

  @NotNull(message = MANDATORY_MESSAGE)
  @JsonProperty("endpoint_platform")
  private Endpoint.PLATFORM_TYPE platform;

  @NotNull(message = MANDATORY_MESSAGE)
  @JsonProperty("endpoint_arch")
  private Endpoint.PLATFORM_ARCH arch;

  @JsonProperty("endpoint_mac_addresses")
  private String[] macAddresses;
}
