package io.openbas.engine.api;

import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateHistogramRuntime {
  private DateHistogramConfig config;
  private Map<String, String> parameters;

  public DateHistogramRuntime(DateHistogramConfig config) {
    this.config = config;
    this.parameters = new HashMap<>();
  }

  public DateHistogramRuntime(DateHistogramConfig config, Map<String, String> parameters) {
    this.config = config;
    this.parameters = parameters;
  }
}
