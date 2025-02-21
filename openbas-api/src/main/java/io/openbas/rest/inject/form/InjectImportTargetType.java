package io.openbas.rest.inject.form;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum InjectImportTargetType {
  @JsonProperty
  ATOMIC_TESTING,
  @JsonProperty
  SIMULATION,
  @JsonProperty
  SCENARIO,
}
