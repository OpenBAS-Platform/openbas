package io.openbas.rest.asset.endpoint.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class AgentOutput {

  @Schema(description = "Agent id")
  @JsonProperty("agent_id")
  private String id;

  @Schema(description = "Agent privilege")
  @JsonProperty("agent_privilege")
  private Agent.PRIVILEGE privilege;

  @Schema(description = "Agent deployment mode")
  @JsonProperty("agent_deployment_mode")
  private Agent.DEPLOYMENT_MODE deploymentMode;

  @Schema(description = "User")
  @JsonProperty("agent_executed_by_user")
  private String executedByUser;

  @Schema(description = "Agent executor")
  @JsonProperty("agent_executor")
  private ExecutorOutput executor;

  @Schema(
      description =
          "Indicates whether the endpoint is active. "
              + "The endpoint is considered active if it was seen in the last 3 minutes.")
  @JsonProperty("agent_active")
  private boolean isActive;
}
