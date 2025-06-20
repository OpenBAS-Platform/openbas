package io.openbas.engine.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public enum WidgetType {
  @JsonProperty("vertical-barchart")
  VERTICAL_BAR_CHART("vertical-barchart"),
  @JsonProperty("security-coverage")
  SECURITY_COVERAGE_CHART("security-coverage"),
  @JsonProperty("line")
  LINE("line"),
  @JsonProperty("donut")
  DONUT("donut"),
  @JsonProperty("list")
  LIST("list");

  public final String type;

  WidgetType(@NotNull final String type) {
    this.type = type;
  }
}