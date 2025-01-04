package io.openbas.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Agent;
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
public class EndpointOutput {

  @Schema(description = "Asset Id")
  @JsonProperty("asset_id")
  @NotBlank
  private String id;

  @Schema(description = "Asset name")
  @JsonProperty("asset_name")
  @NotBlank
  private String name;

  @Schema(
      description =
          "Indicates whether the endpoint is active. "
              + "The endpoint is considered active if it was seen in the last 3 minutes.")
  @JsonProperty("endpoint_active")
  private boolean isActive;

  @Schema(description = "List agent privilege")
  @JsonProperty("endpoint_agents_privilege")
  private List<Agent.PRIVILEGE> privileges;

  @Schema(description = "Platform")
  @JsonProperty("endpoint_platform")
  private Endpoint.PLATFORM_TYPE platform;

  @Schema(description = "Architecture")
  @JsonProperty("endpoint_arch")
  private Endpoint.PLATFORM_ARCH arch;

  @Schema(description = "List of agent executors")
  @JsonProperty("endpoint_agents_executor")
  private List<ExecutorOutput> executors;

  @Schema(description = "Tags")
  @JsonProperty("asset_tags")
  private List<String> tags;
}
