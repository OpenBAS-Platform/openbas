package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;

import java.util.function.Function;

public enum ContractOutputType {
  @JsonProperty("text")
  Text("text", ContractOutputTechnicalType.Text, JsonNode::asText),
  @JsonProperty("Number")
  Number("number", ContractOutputTechnicalType.Number, JsonNode::asText),
  @JsonProperty("port")
  Port("port", ContractOutputTechnicalType.Number, JsonNode::asText),
  @JsonProperty("IPv4")
  IPv4("ipv4", ContractOutputTechnicalType.Text, JsonNode::asText),
  @JsonProperty("IPv6")
  IPv6("ipv6", ContractOutputTechnicalType.Text, JsonNode::asText);

  public final String label;
  public final ContractOutputTechnicalType technicalType;
  public final Function<JsonNode, String> toFindingValue;

  ContractOutputType(String label, ContractOutputTechnicalType technicalType, Function<JsonNode, String> toFindingValue) {
    this.label = label;
    this.technicalType = technicalType;
    this.toFindingValue = toFindingValue;
  }
}
