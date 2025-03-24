package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WidgetDataSelection {

  @JsonProperty("widget_data_selection_label")
  private String label;

  @JsonProperty("widget_data_selection_filter")
  private Filters.FilterGroup filter;

}
