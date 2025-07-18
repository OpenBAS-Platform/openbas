package io.openbas.engine.api.configuration.list;

import io.openbas.database.model.Filters;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ListPerspective {
  private String name;
  private Filters.FilterGroup filter = new Filters.FilterGroup();
  private List<Join<ListPerspective>> joins = new ArrayList<>();
}
