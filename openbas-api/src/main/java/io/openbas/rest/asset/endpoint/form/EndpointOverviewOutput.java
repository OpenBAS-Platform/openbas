package io.openbas.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Endpoint;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class EndpointOverviewOutput {

  @Schema(description = "Endpoint name")
  @JsonProperty("asset_name")
  @NotBlank
  private String name;

  @Schema(description = "Endpoint description")
  @JsonProperty("asset_description")
  private String description;

  @Schema(description = "Hostname")
  @JsonProperty("endpoint_hostname")
  private String hostname;

  @Schema(description = "Platform")
  @JsonProperty("endpoint_platform")
  private Endpoint.PLATFORM_TYPE platform;

  @Schema(description = "Architecture")
  @JsonProperty("endpoint_arch")
  private Endpoint.PLATFORM_ARCH arch;

  @Schema(description = "List IPs")
  @JsonProperty("endpoint_ips")
  private List<String> ips;

  @Schema(description = "List of MAC addresses")
  @JsonProperty("endpoint_mac_addresses")
  private List<String> macAddresses;

  @Schema(description = "List of agents")
  @JsonProperty("asset_agents")
  private List<AgentOutput> agents;

  @Schema(description = "Tags")
  @JsonProperty("asset_tags")
  private List<String> tags;
}
