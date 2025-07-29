package io.openbas.engine.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum CustomDashboardTimeRange {
  @JsonProperty("DEFAULT")
  DEFAULT,
  @JsonProperty("ALL_TIME")
  ALL_TIME,
  @JsonProperty("CUSTOM")
  CUSTOM,
  @JsonProperty("LAST_DAY")
  LAST_DAY,
  @JsonProperty("LAST_WEEK")
  LAST_WEEK,
  @JsonProperty("LAST_MONTH")
  LAST_MONTH,
  @JsonProperty("LAST_QUARTER")
  LAST_QUARTER,
  @JsonProperty("LAST_SEMESTER")
  LAST_SEMESTER,
  @JsonProperty("LAST_YEAR")
  LAST_YEAR
}
