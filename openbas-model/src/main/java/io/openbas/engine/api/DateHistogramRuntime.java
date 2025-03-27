package io.openbas.engine.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateHistogramRuntime {
  private Map<String, String> parameters;
  private List<DateHistogramConfig> configs;

  public DateHistogramRuntime(List<DateHistogramConfig> configs) {
    this.configs = configs;
    this.parameters = new HashMap<>();
  }

  public DateHistogramRuntime(List<DateHistogramConfig> configs, Map<String, String> parameters) {
    this.configs = configs;
    this.parameters = parameters;
  }
}
