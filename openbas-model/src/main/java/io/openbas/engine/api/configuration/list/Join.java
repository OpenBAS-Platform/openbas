package io.openbas.engine.api.configuration.list;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Join<T extends ListPerspective> {
  private final String sourcePropertyName;
  private final T joinedPerspective;
  private final boolean grouped;

  public Join(T perspective, String sourcePropertyName, boolean grouped) {
    this.joinedPerspective = perspective;
    this.sourcePropertyName = sourcePropertyName;
    this.grouped = grouped;
  }
}