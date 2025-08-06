package io.openbas.engine.api;

import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class HistogramWidget extends WidgetConfiguration {

  @Setter(NONE)
  @NotNull
  private final String mode;

  @NotBlank
  @JsonProperty("date_attribute")
  private String dateAttribute;
  private boolean stacked;

  @JsonProperty("display_legend")
  private boolean displayLegend;

  @Nullable
  private String start; // Date or $custom_dashboard_start

  @Nullable
  private String end; // Date or $custom_dashboard_end
  @NotNull
  @JsonProperty("time_range")
  private CustomDashboardTimeRange timeRange;

  HistogramWidget(String mode) {
    super(
        "temporal".equals(mode)
            ? WidgetConfigurationType.TEMPORAL_HISTOGRAM
            : WidgetConfigurationType.STRUCTURAL_HISTOGRAM);
    this.mode = mode;
  }
}
