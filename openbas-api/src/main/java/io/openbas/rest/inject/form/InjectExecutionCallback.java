package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InjectExecutionCallback {
  @JsonProperty("agent_id")
  private String agentId;

  @JsonProperty("inject_id")
  private String injectId;

  @JsonProperty("inject_execution_input")
  private InjectExecutionInput injectExecutionInput;
}
