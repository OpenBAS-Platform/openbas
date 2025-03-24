package io.openbas.engine.query;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsStructuralSeriesData {
  private String label;
  private long value;

  public EsStructuralSeriesData(String label, long value) {
    this.label = label;
    this.value = value;
  }
}
