package io.openbas.engine.api;

import io.openbas.database.model.Filters;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ListConfiguration extends WidgetConfiguration {

  @NotNull
  List<ListSeries> series = new ArrayList<>();

  List<String> columns = new ArrayList<>();

  @Data
  public static class ListSeries {
    private String name;
    private Filters.FilterGroup filter = new Filters.FilterGroup();
  }
}
