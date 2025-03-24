package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WidgetParameters {

  public enum WidgetParametersMode {
    @JsonProperty("structure")
    STRUCTURE("structure"),
    @JsonProperty("temporal")
    TEMPORAL("temporal");

    public final String mode;

    WidgetParametersMode(@NotNull final String mode) {
      this.mode = mode;
    }
  }

  @JsonProperty("widget_parameters_title")
  private String title;

  @JsonProperty("widget_parameters_mode")
  private WidgetParametersMode mode;

  @JsonProperty("widget_parameters_stacked")
  private boolean stacked;

  @JsonProperty("widget_parameters_display_legend")
  private boolean displayLegend;

}
