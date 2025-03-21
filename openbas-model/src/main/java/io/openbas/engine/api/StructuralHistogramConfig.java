package io.openbas.engine.api;

import io.openbas.database.model.Filters;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StructuralHistogramConfig {
  private Filters.FilterGroup filter;
  private String field = "id";

  public StructuralHistogramConfig() {
    // Default constructor
  }

  public StructuralHistogramConfig(Filters.FilterGroup filter) {
    this();
    this.filter = filter;
  }
}
