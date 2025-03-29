package io.openbas.rest.custom_dashboard.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;
import static java.util.Objects.requireNonNull;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Widget;
import io.openbas.engine.api.HistogramWidget;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WidgetInput {

  @JsonProperty("widget_type")
  @NotNull(message = MANDATORY_MESSAGE)
  private Widget.WidgetType type;

  @JsonProperty("widget_config")
  @NotNull(message = MANDATORY_MESSAGE)
  private HistogramWidget histogramWidget;

  // -- METHOD --

  public Widget toWidget(@NotNull Widget widget) {
    requireNonNull(widget, "Widget must not be null.");

    widget.setType(this.getType());
    widget.setHistogramWidget(this.getHistogramWidget());
    return widget;
  }
}
