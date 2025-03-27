package io.openbas.engine.api;

import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramRuntime {
  private StructuralHistogramConfig config;
  private Map<String, String> parameters;

  public StructuralHistogramRuntime(StructuralHistogramConfig config) {
    this.config = config;
    this.parameters = new HashMap<>();
  }

  public StructuralHistogramRuntime(
      StructuralHistogramConfig config, Map<String, String> parameters) {
    this.config = config;
    this.parameters = parameters;
  }
}
