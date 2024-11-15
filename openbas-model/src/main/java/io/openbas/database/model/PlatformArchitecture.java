package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PlatformArchitecture {
  @JsonProperty("x86_64")
  x86_64,
  @JsonProperty("arm64")
  arm64,
  @JsonProperty("Unknown")
  Unknown,
}
