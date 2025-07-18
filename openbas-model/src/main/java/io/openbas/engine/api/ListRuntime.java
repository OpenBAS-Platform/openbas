package io.openbas.engine.api;

import io.openbas.database.model.CustomDashboardParameters;
import java.util.Map;

import io.openbas.engine.api.configuration.list.ListConfiguration;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListRuntime extends Runtime {

  private ListConfiguration widget;

  public ListRuntime(
      ListConfiguration widget,
      Map<String, String> parameters,
      Map<String, CustomDashboardParameters> definitionParameters) {
    this.widget = widget;
    this.parameters = parameters;
    this.definitionParameters = definitionParameters;
  }
}
