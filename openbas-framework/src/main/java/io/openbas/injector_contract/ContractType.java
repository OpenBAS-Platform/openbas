package io.openbas.injector_contract;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContractType {
  @JsonProperty("text")
  Text("text"),
  @JsonProperty("number")
  Number("number"),
  @JsonProperty("tuple")
  Tuple("tuple"),
  @JsonProperty("checkbox")
  Checkbox("checkbox"),
  @JsonProperty("textarea")
  Textarea("textarea"),
  @JsonProperty("select")
  Select("select"),
  @JsonProperty("choice")
  Choice("choice"),
  @JsonProperty("article")
  Article("article"),
  @JsonProperty("challenge")
  Challenge("challenge"),
  @JsonProperty("dependency-select")
  DependencySelect("dependency-select"),
  @JsonProperty("attachment")
  Attachment("attachment"),
  @JsonProperty("team")
  Team("team"),
  @JsonProperty("expectation")
  Expectation("expectation"),
  @JsonProperty("asset")
  Asset("asset"),
  @JsonProperty("asset-group")
  AssetGroup("asset-group"),
  @JsonProperty("payload")
  Payload("payload");

  public final String label;

  ContractType(String label) {
    this.label = label;
  }
  ContractType() {
    this.label = this.name();
  }
}
