package io.openbas.engine.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsStructuralSeries {
  private String label;
  private long value;

  public EsStructuralSeries(String label, long value) {
    this.label = label;
    this.value = value;
  }
}
