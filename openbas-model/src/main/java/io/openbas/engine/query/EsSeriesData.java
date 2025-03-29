package io.openbas.engine.query;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsSeriesData {
  private String label;
  private long value;

  public EsSeriesData(String label, long value) {
    this.label = label;
    this.value = value;
  }
}
