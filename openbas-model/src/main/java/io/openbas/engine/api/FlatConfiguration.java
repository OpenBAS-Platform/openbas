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
public class FlatConfiguration extends WidgetConfiguration {

  @NotNull List<FlatSeries> series = new ArrayList<>();

  @Data
  public static class FlatSeries {
    private String name;
    private Filters.FilterGroup filter = new Filters.FilterGroup();
  }

  public FlatConfiguration() {
    super(WidgetConfigurationType.FLAT);
  }
}
