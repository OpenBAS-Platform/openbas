package io.openbas.engine.api;

import static io.openbas.engine.api.HistogramWidget.HistogramConfigMode.TEMPORAL;

import io.openbas.database.model.Filters;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateHistogramWidget extends HistogramWidget {

  @NotNull List<DateHistogramSeries> series = new ArrayList<>();
  @NotNull private HistogramInterval interval = HistogramInterval.day;
  @NotNull private String start; // Date or $custom_dashboard_start
  @NotNull private String end; // Date or $custom_dashboard_end

  @Data
  public static class DateHistogramSeries {
    private String name;
    private Filters.FilterGroup filter;
  }

  public DateHistogramWidget() {
    super(TEMPORAL);
  }
}
