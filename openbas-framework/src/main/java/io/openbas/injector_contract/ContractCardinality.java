package io.openbas.injector_contract;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("PackageAccessibility")
public enum ContractCardinality {
  @JsonProperty("1")
  One,
  @JsonProperty("n")
  Multiple
}
