package io.openbas.utils.pagination;

import io.openbas.utils.pagination.PaginationField.Filter;
import io.openbas.utils.pagination.PaginationField.FilterGroup;

import javax.annotation.Nullable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Predicate;

import static io.openbas.utils.pagination.PaginationField.FilterMode.and;
import static io.openbas.utils.pagination.PaginationField.FilterMode.or;
import static io.openbas.utils.schema.SchemaUtils.getPropertyInfo;

public class FilterUtils {

  private static final Predicate<Object> EMPTY_PREDICATE = (value) -> true;

  public static Predicate<Object> computeFilters(PaginationField input) {
    FilterGroup filterGroup = input.getFilterGroup();
    if (filterGroup != null) {
      return computeFilterGroup(filterGroup);
    }
    return EMPTY_PREDICATE;
  }

  private static Predicate<Object> computeFilterGroup(@Nullable final FilterGroup filterGroup) {
    if (filterGroup == null) {
      return EMPTY_PREDICATE;
    }
    List<Filter> filters = Optional.ofNullable(filterGroup.getFilters()).orElse(new ArrayList<>());
    PaginationField.FilterMode mode = Optional.ofNullable(filterGroup.getMode()).orElse(and);

    if (!filters.isEmpty()) {
      List<Predicate<Object>> list = filters
          .stream()
          .map(FilterUtils::computeFilter)
          .toList();
      Predicate<Object> result = null;
      for (Predicate<Object> el : list) {
        if (result == null) {
          result = el;
        } else {
          if (or.equals(mode)) {
            result = result.or(el);
          } else {
            // Default case
            result = result.and(el);
          }
        }
      }
      return result;
    }
    return EMPTY_PREDICATE;
  }

  // FIXME: Handle only FilterOperator EQ for now
  @SuppressWarnings("unchecked")
  private static Predicate<Object> computeFilter(@Nullable final Filter filter) {
    if (filter == null) {
      return EMPTY_PREDICATE;
    }
    String filterKey = filter.getKey();
    List<String> filterValues = filter.getValues();

    if (!filterValues.isEmpty()) {
      return (value) -> {
        Map.Entry<Class<Object>, Object> entry = getPropertyInfo(value, filterKey);
        if (entry == null || entry.getValue() == null) {
          return false;
        }
        if (entry.getKey().isAssignableFrom(Map.class)
            || entry.getKey().getName().contains("ImmutableCollections")) {
          return ((Map) entry.getValue()).values()
              .stream()
              .anyMatch(v -> equalsTexts(v, filterValues));
        } else if (entry.getKey().isAssignableFrom(String.class)
            || entry.getKey().isAssignableFrom(Boolean.class)) {
          return equalsTexts(entry.getValue(), filterValues);
        } else {
          throw new UnsupportedOperationException(
              "Filtering is not implemented for other property than Map, String and Boolean");
        }
      };
    }
    return EMPTY_PREDICATE;
  }

  private static boolean equalsTexts(Object value, List<String> texts) {
    return texts.stream().anyMatch(text -> equalsText(value, text));
  }

  private static boolean equalsText(Object value, String text) {
    if (value.getClass().isAssignableFrom(Boolean.class)) {
      return value.equals(Boolean.parseBoolean(text));
    } else {
      return ((String) value).equalsIgnoreCase(text);
    }
  }

}
