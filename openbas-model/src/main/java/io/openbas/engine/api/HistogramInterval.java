package io.openbas.engine.api;

import co.elastic.clients.elasticsearch._types.aggregations.CalendarInterval;

public enum HistogramInterval {
  year(CalendarInterval.Year, "YYYY"),
  month(CalendarInterval.Month, "YYYY-MM"),
  week(CalendarInterval.Week, "YYYY-MM-DD"),
  day(CalendarInterval.Day, "YYYY-MM-DD"),
  hour(CalendarInterval.Hour, "YYYY-MM-DD HH:mm:ss"),
  quarter(CalendarInterval.Quarter, "YYYY-MM");

  public final CalendarInterval type;
  public final String format;

  HistogramInterval(CalendarInterval type, String format) {
    this.type = type;
    this.format = format;
  }
}
