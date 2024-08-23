package io.openbas.database.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import javax.annotation.Nullable;
import java.util.List;
import java.util.Optional;

public class Filters {

  public enum FilterMode {
    and,
    or
  }

  public enum FilterOperator {
    eq,
    not_eq,
    contains,
    not_contains,
    starts_with,
    not_starts_with,
    gt,
    gte,
    lt,
    lte,
    empty,
    not_empty,
  }

  @Data
  public static class FilterGroup {

    @NotNull
    private FilterMode mode; // Between filters
    private List<Filter> filters;

    // -- UTILS --

    public Optional<Filter> findByKey(@NotBlank final String filterKey) {
      if (this.getFilters() == null) {
        return Optional.empty();
      }

      return this.getFilters()
          .stream()
          .filter(filter -> filter.getKey().equals(filterKey))
          .findFirst();
    }

    public void removeByKey(@NotBlank final String filterKey) {
      if (this.getFilters() == null) {
        return;
      }

      List<Filter> newFilters = this.getFilters()
          .stream()
          .filter(filter -> !filter.getKey().equals(filterKey))
          .toList();
      this.setFilters(newFilters);
    }

  }

  @Data
  public static class Filter {

    @NotNull
    private String key;
    private FilterMode mode; // Between values: name = name1 OR name = name2
    private List<String> values;
    private FilterOperator operator;
  }

  public static boolean isEmptyFilterGroup(@Nullable final FilterGroup filterGroup) {
    return filterGroup == null || filterGroup.getFilters() == null || filterGroup.getFilters().isEmpty();
  }

}
