package io.openbas.engine.model.vulnerableendpoint;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum AgentPrivilege {
  @JsonProperty("admin")
  ADMIN,
  @JsonProperty("user")
  USER,
}
