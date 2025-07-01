package io.openbas.engine.api;

import java.util.Map;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListRuntime {
  private Map<String, String> parameters;
  private ListConfiguration widget;

  public ListRuntime(ListConfiguration widget, Map<String, String> parameters) {
    this.widget = widget;
    this.parameters = parameters;
  }
}
