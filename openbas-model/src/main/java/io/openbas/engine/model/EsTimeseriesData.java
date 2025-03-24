package io.openbas.engine.model;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsTimeseriesData {
  private Instant date;
  private long value;

  public EsTimeseriesData(Instant date, long value) {
    this.date = date;
    this.value = value;
  }
}
