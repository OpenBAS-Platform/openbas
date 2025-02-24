package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum ContractOutputType {
  @JsonProperty("text")
  Text("text"),
  @JsonProperty("port")
  Port("port"),
  @JsonProperty("IPv4")
  IPv4("ipv4"),
  @JsonProperty("IPv6")
  IPv6("ipv6");

  public final String label;

  ContractOutputType(String label) {
    this.label = label;
  }
}
