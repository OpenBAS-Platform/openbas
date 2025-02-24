package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContractOutputTechnicalType {
  @JsonProperty("text")
  Text("text"),
  @JsonProperty("number")
  Number("number"),
  @JsonProperty("boolean")
  Boolean("boolean");

  public final String label;

  ContractOutputTechnicalType(String label) {
    this.label = label;
  }
}
