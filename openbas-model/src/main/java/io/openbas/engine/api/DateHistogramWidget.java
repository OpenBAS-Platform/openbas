package io.openbas.engine.api;

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

  public static final String TEMPORAL_MODE = "temporal";

  @NotNull List<DateHistogramSeries> series = new ArrayList<>();
  @NotNull private HistogramInterval interval = HistogramInterval.day;

  @Data
  public static class DateHistogramSeries {

    private String name;
    private Filters.FilterGroup filter = new Filters.FilterGroup();
  }

  public DateHistogramWidget() {
    super(TEMPORAL_MODE);
  }
}
