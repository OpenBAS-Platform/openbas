package io.openbas.rest.asset.endpoint.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;
import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Agent;
import io.openbas.database.model.Executor;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class EndpointRegisterInput extends EndpointInput {

  @NotNull(message = MANDATORY_MESSAGE)
  @JsonProperty("asset_external_reference")
  private String externalReference;

  @JsonProperty("agent_is_service")
  private boolean isService = true;

  @JsonProperty("agent_is_elevated")
  private boolean isElevated = true;

  @JsonProperty("agent_executed_by_user")
  private String executedByUser = Agent.ADMIN_SYSTEM_WINDOWS;

  @JsonProperty("agent_executor")
  private Executor executor;

  @JsonProperty("agent_process_name")
  private String processName;

  @JsonProperty("agent_active")
  public boolean isActive() {
    return this.getLastSeen() != null
        && (now().toEpochMilli() - this.getLastSeen().toEpochMilli()) < Agent.ACTIVE_THRESHOLD;
  }
}
