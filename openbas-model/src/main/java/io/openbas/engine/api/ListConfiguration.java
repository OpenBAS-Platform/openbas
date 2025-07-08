package io.openbas.engine.api;

import static io.openbas.config.EngineConfig.Defaults.ENTITIES_CAP;

import io.openbas.database.model.Filters;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListConfiguration extends WidgetConfiguration {

  @NotNull List<ListSeries> series = new ArrayList<>();

  List<String> columns = new ArrayList<>();

  List<EngineSortField> sorts;

  @Positive
  @Min(1)
  int limit = ENTITIES_CAP;

  @Data
  public static class ListSeries {
    private String name;
    private Filters.FilterGroup filter = new Filters.FilterGroup();
  }

  public ListConfiguration() {
    super(WidgetConfigurationType.LIST);
  }
}
