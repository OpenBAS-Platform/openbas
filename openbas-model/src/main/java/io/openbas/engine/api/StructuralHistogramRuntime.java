package io.openbas.engine.api;

import io.openbas.database.model.CustomDashboardParameters;
import java.util.Map;

import io.openbas.engine.api.configuration.StructuralHistogramConfiguration;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramRuntime extends Runtime {
  private StructuralHistogramConfiguration widget;

  public StructuralHistogramRuntime(
      StructuralHistogramConfiguration widget,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    this.widget = widget;
    this.parameters = parameters;
    this.definitionParameters = definitionParameters;
  }
}
