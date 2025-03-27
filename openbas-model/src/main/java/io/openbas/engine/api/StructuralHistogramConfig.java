package io.openbas.engine.api;

import io.openbas.database.model.Filters;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramConfig extends HistogramConfig {
  private String name;
  private String field = "base_id";
  private Filters.FilterGroup filter;

  public StructuralHistogramConfig() {
    super("structural");
  }

  public StructuralHistogramConfig(String name) {
    this();
    this.name = name;
  }

  public StructuralHistogramConfig(String name, Filters.FilterGroup filter) {
    this(name);
    this.filter = filter;
  }
}
