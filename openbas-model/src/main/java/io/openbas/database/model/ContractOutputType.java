package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import org.apache.commons.validator.routines.InetAddressValidator;

import java.util.function.Function;

public enum ContractOutputType {
  @JsonProperty("text")
  Text("text", ContractOutputTechnicalType.Text, JsonNode::asText),
  @JsonProperty("Number")
  Number("number", ContractOutputTechnicalType.Number, JsonNode::asText),
  @JsonProperty("port")
  Port("port", ContractOutputTechnicalType.Number, JsonNode::asText),
  @JsonProperty("IPv4")
  IPv4("ipv4", ContractOutputTechnicalType.Text, (JsonNode jsonNode) -> {
    if( InetAddressValidator.getInstance().isValidInet4Address(jsonNode.asText()) ) {
      return jsonNode.asText();
    }
    throw new IllegalArgumentException("IPv4 is not correctly formatted");
  }),
  @JsonProperty("IPv6")
  IPv6("ipv6", ContractOutputTechnicalType.Text, (JsonNode jsonNode) -> {
    if( InetAddressValidator.getInstance().isValidInet6Address(jsonNode.asText()) ) {
      return jsonNode.asText();
    }
    throw new IllegalArgumentException("IPv6 is not correctly formatted");
  }),
  @JsonProperty("Credentials")
  Credentials("credentials", ContractOutputTechnicalType.Object, (JsonNode jsonNode) -> {
    if( jsonNode.get("username") != null && jsonNode.get("password") != null ) {
      String username = jsonNode.get("username").asText();
      String password = jsonNode.get("password").asText();
      return username + ":" + password;
    }
    throw new IllegalArgumentException("Credentials is not correctly formatted");
  });

  public final String label;
  public final ContractOutputTechnicalType technicalType;
  public final Function<JsonNode, String> toFindingValue;

  ContractOutputType(String label, ContractOutputTechnicalType technicalType, Function<JsonNode, String> toFindingValue) {
    this.label = label;
    this.technicalType = technicalType;
    this.toFindingValue = toFindingValue;
  }
}
