package io.openbas.engine.api;

import io.openbas.database.model.CustomDashboardParameters;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CountRuntime extends Runtime {

  private CountConfig config;

  public CountRuntime(
      CountConfig config,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    this.config = config;
    this.parameters = parameters;
    this.definitionParameters = definitionParameters;
  }
}
