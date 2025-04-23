package io.openbas.engine.api;

import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateHistogramRuntime {
  private Map<String, String> parameters;
  private DateHistogramWidget widget;

  public DateHistogramRuntime(DateHistogramWidget widget) {
    this.widget = widget;
    this.parameters = new HashMap<>();
  }

  public DateHistogramRuntime(DateHistogramWidget widget, Map<String, String> parameters) {
    this.widget = widget;
    this.parameters = parameters;
  }
}
