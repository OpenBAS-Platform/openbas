package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InjectExecutionCallback {
  @JsonProperty("agent_id")
  private String agentId;

  @JsonProperty("inject_id")
  private String injectId;

  @JsonProperty("inject_execution_input")
  private InjectExecutionInput injectExecutionInput;

  @JsonProperty("execution_emission_date")
  private Instant emissionDate;
}
