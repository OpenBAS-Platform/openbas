package io.openbas.engine.model.vulnerableendpoint;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum AgentStatus {
  @JsonProperty("Active")
  ACTIVE,
  @JsonProperty("Agentless")
  AGENTLESS,
  @JsonProperty("Inactive")
  INACTIVE,
}
