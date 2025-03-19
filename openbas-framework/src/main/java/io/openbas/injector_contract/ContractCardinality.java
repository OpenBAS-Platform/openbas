package io.openbas.injectorContract;

import com.fasterxml.jackson.annotation.JsonProperty;

@SuppressWarnings("PackageAccessibility")
public enum ContractCardinality {
  @JsonProperty("1")
  One,
  @JsonProperty("n")
  Multiple
}
