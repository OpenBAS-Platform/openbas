package io.openbas.engine.api;

import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramRuntime {
  private Map<String, String> parameters;
  private StructuralHistogramWidget widget;

  public StructuralHistogramRuntime(
      StructuralHistogramWidget widget, Map<String, String> parameters) {
    this.widget = widget;
    this.parameters = parameters;
  }
}
