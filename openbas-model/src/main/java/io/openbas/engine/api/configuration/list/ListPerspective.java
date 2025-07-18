package io.openbas.engine.api.configuration.list;

import io.openbas.database.model.Filters;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Getter
@Setter
public class ListPerspective {
  private String name;
  private Filters.FilterGroup filter = new Filters.FilterGroup();
  private List<Join<ListPerspective>> joins = new ArrayList<>();

  public String getEntityName() {
    Optional<Filters.Filter> entityFilter = filter.getFilters().stream().filter(f -> "base_entity".equals(f.getKey())).findAny();
    if (entityFilter.isPresent()) {
      return entityFilter.get().getValues().getFirst();
    }
    throw new IllegalStateException("No filter found for key 'base_entity' in perspective configuration.");
  }
}
