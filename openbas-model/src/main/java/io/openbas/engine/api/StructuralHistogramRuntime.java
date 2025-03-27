package io.openbas.engine.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramRuntime {
  private Map<String, String> parameters;
  private List<StructuralHistogramConfig> configs;

  public StructuralHistogramRuntime(List<StructuralHistogramConfig> configs) {
    this.configs = configs;
    this.parameters = new HashMap<>();
  }

  public StructuralHistogramRuntime(
      List<StructuralHistogramConfig> configs, Map<String, String> parameters) {
    this.configs = configs;
    this.parameters = parameters;
  }
}
