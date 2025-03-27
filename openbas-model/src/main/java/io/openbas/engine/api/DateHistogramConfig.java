package io.openbas.engine.api;

import io.openbas.database.model.Filters;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateHistogramConfig extends HistogramConfig {
  private String name;
  private String start;
  private String end;
  private String field = "base_created_at";
  private Filters.FilterGroup filter;
  private HistogramInterval interval = HistogramInterval.day;

  public DateHistogramConfig() {
    super("temporal");
  }

  public DateHistogramConfig(String name) {
    this();
    this.name = name;
    this.end = Instant.now().toString();
    this.start = Instant.parse(this.end).minus(30, ChronoUnit.DAYS).toString();
  }

  public DateHistogramConfig(String name, Filters.FilterGroup filter) {
    this(name);
    this.filter = filter;
  }

  public DateHistogramConfig(String name, String start, String end) {
    this(name);
    this.start = start;
    this.end = end;
  }
}
