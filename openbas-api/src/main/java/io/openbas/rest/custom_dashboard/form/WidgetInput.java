package io.openbas.rest.custom_dashboard.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Widget;
import io.openbas.database.model.WidgetDataSelection;
import io.openbas.database.model.WidgetParameters;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;
import static java.util.Objects.requireNonNull;

@Getter
@Setter
public class WidgetInput {

  @JsonProperty("widget_type")
  @NotNull(message = MANDATORY_MESSAGE)
  private Widget.WidgetType type;

  @JsonProperty("widget_data_selections")
  @NotNull(message = MANDATORY_MESSAGE)
  private List<WidgetDataSelection> dataSelections;

  @JsonProperty("widget_parameters")
  @NotNull(message = MANDATORY_MESSAGE)
  private WidgetParameters parameters;

  // -- METHOD --

  public Widget toWidget(@NotNull Widget widget) {
    requireNonNull(widget, "Widget must not be null.");

    widget.setType(this.getType());
    widget.setDataSelections(this.getDataSelections());
    widget.setParameters(this.getParameters());
    return widget;
  }
}
