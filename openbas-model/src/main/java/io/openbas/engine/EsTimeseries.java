package io.openbas.engine;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsTimeseries {
  private Instant date;
  private long value;

  public EsTimeseries(Instant date, long value) {
    this.date = date;
    this.value = value;
  }
}
