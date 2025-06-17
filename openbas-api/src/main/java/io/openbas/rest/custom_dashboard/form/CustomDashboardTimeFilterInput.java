package io.openbas.rest.custom_dashboard.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.engine.api.CustomDashboardTimeRange;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class CustomDashboardTimeFilterInput {

  @JsonProperty("custom_dashboard_time_range")
  @NotNull
  private CustomDashboardTimeRange timeRange;

  @JsonProperty("custom_dashboard_start_date")
  private Instant startDate;

  @JsonProperty("custom_dashboard_end_date")
  private Instant endDate;

}
