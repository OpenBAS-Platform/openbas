package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WidgetLayout {

  @JsonProperty("widget_layout_w")
  protected int w;

  @JsonProperty("widget_layout_h")
  protected int h;

  @JsonProperty("widget_layout_x")
  protected int x;

  @JsonProperty("widget_layout_y")
  protected int y;

}
