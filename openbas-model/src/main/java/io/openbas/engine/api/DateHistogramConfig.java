package io.openbas.engine.api;

import io.openbas.database.model.Filters;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateHistogramConfig {
  private String name;
  private Instant start;
  private Instant end;
  private Filters.FilterGroup filter;
  private String field = "base_created_at";
  private HistogramInterval interval = HistogramInterval.day;

  public DateHistogramConfig(String name) {
    this.name = name;
    this.end = Instant.now();
    this.start = this.end.minus(30, ChronoUnit.DAYS);
  }

  public DateHistogramConfig(String name, Filters.FilterGroup filter) {
    this(name);
    this.filter = filter;
  }

  public DateHistogramConfig(String name, Instant start, Instant end) {
    this(name);
    this.start = start;
    this.end = end;
  }
}
