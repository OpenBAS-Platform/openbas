package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import org.apache.commons.validator.routines.InetAddressValidator;

public enum ContractOutputType {
  @JsonProperty("text")
  Text(
      "text",
      ContractOutputTechnicalType.Text,
      null,
      true,
      Objects::nonNull,
      JsonNode::asText,
      null,
      null,
      null),
  @JsonProperty("number")
  Number(
      "number",
      ContractOutputTechnicalType.Number,
      null,
      true,
      Objects::nonNull,
      JsonNode::asText,
      null,
      null,
      null),
  @JsonProperty("port")
  Port(
      "port",
      ContractOutputTechnicalType.Number,
      null,
      true,
      Objects::nonNull,
      JsonNode::asText,
      null,
      null,
      null),
  @JsonProperty("portscan")
  PortsScan(
      "portscan",
      ContractOutputTechnicalType.Object,
      new ArrayList<>(
          List.of(
              new ContractOutputField("asset_id", ContractOutputTechnicalType.Text, false),
              new ContractOutputField("host", ContractOutputTechnicalType.Text, true),
              new ContractOutputField("port", ContractOutputTechnicalType.Number, true),
              new ContractOutputField("service", ContractOutputTechnicalType.Text, true))),
      true,
      (JsonNode jsonNode) ->
          jsonNode.get("host") != null
              && jsonNode.get("port") != null
              && jsonNode.get("service") != null,
      (JsonNode jsonNode) -> {
        String host = jsonNode.get("host").asText();
        String port = jsonNode.get("port").asText();
        String service = jsonNode.get("service").asText();
        return host + ":" + port + " (" + service + ")";
      },
      (JsonNode jsonNode) -> {
        if (jsonNode.get("asset_id") != null) {
          return List.of(jsonNode.get("asset_id").asText());
        }
        return new ArrayList<>();
      },
      null,
      null),
  @JsonProperty("ipv4")
  IPv4(
      "ipv4",
      ContractOutputTechnicalType.Text,
      null,
      true,
      (JsonNode jsonNode) ->
          InetAddressValidator.getInstance().isValidInet4Address(jsonNode.asText()),
      JsonNode::asText,
      null,
      null,
      null),
  @JsonProperty("ipv6")
  IPv6(
      "ipv6",
      ContractOutputTechnicalType.Text,
      null,
      true,
      (JsonNode jsonNode) ->
          InetAddressValidator.getInstance().isValidInet6Address(jsonNode.asText()),
      JsonNode::asText,
      null,
      null,
      null),
  @JsonProperty("credentials")
  Credentials(
      "credentials",
      ContractOutputTechnicalType.Object,
      new ArrayList<>(
          List.of(
              new ContractOutputField("username", ContractOutputTechnicalType.Text, true),
              new ContractOutputField("password", ContractOutputTechnicalType.Text, true))),
      true,
      (JsonNode jsonNode) -> jsonNode.get("username") != null && jsonNode.get("password") != null,
      (JsonNode jsonNode) -> {
        String username = jsonNode.get("username").asText();
        String password = jsonNode.get("password").asText();
        return username + ":" + password;
      },
      null,
      null,
      null);

  public final String label;
  public final ContractOutputTechnicalType technicalType;
  public final List<ContractOutputField> fields;
  public final Boolean isFindingCompatible;
  public final Function<JsonNode, Boolean> validate;
  public final Function<JsonNode, String> toFindingValue;
  public final Function<JsonNode, List<String>> toFindingAssets;
  public final Function<JsonNode, List<String>> toFindingUsers;
  public final Function<JsonNode, List<String>> toFindingTeams;

  ContractOutputType(
      String label,
      ContractOutputTechnicalType technicalType,
      List<ContractOutputField> fields,
      Boolean isFindingCompatible,
      Function<JsonNode, Boolean> validate,
      Function<JsonNode, String> toFindingValue,
      Function<JsonNode, List<String>> toFindingAssets,
      Function<JsonNode, List<String>> toFindingUsers,
      Function<JsonNode, List<String>> toFindingTeams) {
    this.label = label;
    this.technicalType = technicalType;
    this.fields = fields; // used only for object, to declare the composition of the object
    this.isFindingCompatible = isFindingCompatible;
    this.validate = validate;
    this.toFindingValue = toFindingValue;
    this.toFindingAssets = toFindingAssets;
    this.toFindingUsers = toFindingUsers;
    this.toFindingTeams = toFindingTeams;
  }
}
