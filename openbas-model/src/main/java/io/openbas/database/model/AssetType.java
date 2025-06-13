package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;

// FIXME: hook this into Endpoint and SecurityPlatform models
public enum AssetType {
  @JsonProperty("asset_type_endpoint")
  Endpoint("Endpoint"),
  @JsonProperty("asset_type_security_platform")
  SecurityPlatform("Security Platform");

  public final String value;

  AssetType(String value) {
    this.value = value;
  }
}
