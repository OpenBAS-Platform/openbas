package io.openbas.utils.fixtures;

import io.openbas.database.model.Filters;
import io.openbas.utils.pagination.PaginationField;

import java.util.List;

public class PaginationFixture {

  public static PaginationField.PaginationFieldBuilder getDefault() {
    return PaginationField.builder()
        .page(0)
        .size(10);
  }

  public static PaginationField simpleFilter(String key, String value, Filters.FilterOperator operator) {
    Filters.Filter filter = new Filters.Filter();
    filter.setKey(key);
    filter.setValues(List.of(value));
    filter.setOperator(operator);
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    filterGroup.setFilters(List.of(filter));
    return getDefault()
        .filterGroup(filterGroup)
        .build();
  }

}
