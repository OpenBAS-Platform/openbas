package io.openbas.engine.api.configuration;

import io.openbas.database.model.Filters;
import io.openbas.engine.api.HistogramInterval;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DateHistogramConfiguration extends HistogramConfiguration {

  public static final String TEMPORAL_MODE = "temporal";

  @NotNull List<DateHistogramSeries> series = new ArrayList<>();
  @NotNull private HistogramInterval interval = HistogramInterval.day;
  @NotNull private String start; // Date or $custom_dashboard_start
  @NotNull private String end; // Date or $custom_dashboard_end

  @Data
  public static class DateHistogramSeries {
    private String name;
    private Filters.FilterGroup filter = new Filters.FilterGroup();
  }

  public DateHistogramConfiguration() {
    super(TEMPORAL_MODE);
  }
}
