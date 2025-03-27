package io.openbas.engine.api;

import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CountRuntime {
  private CountConfig config;
  private Map<String, String> parameters;

  public CountRuntime(CountConfig config) {
    this.config = config;
    this.parameters = new HashMap<>();
  }

  public CountRuntime(CountConfig config, Map<String, String> parameters) {
    this.config = config;
    this.parameters = parameters;
  }
}
