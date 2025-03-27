package io.openbas.engine.api;

import io.openbas.database.model.Filters;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CountConfig {
  private String name;
  private Filters.FilterGroup filter;

  public CountConfig(String name) {
    this.name = name;
  }

  public CountConfig(String name, Filters.FilterGroup filter) {
    this(name);
    this.filter = filter;
  }
}
