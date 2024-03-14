package io.openbas.utils.pagination;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class PaginationField {

  @Schema(description = "Filter object to search within filterable attributes")
  private FilterGroup filterGroup;

  @Schema(description = "Text to search within searchable attributes")
  private String textSearch;

  @Schema(description = "List of sort fields : a field is composed of a property (for instance \"label\" and an optional direction (\"asc\" is assumed if no direction is specified) : (\"desc\", \"asc\")")
  private List<SortField> sorts = new ArrayList<>();

  public Sort getSort() {
    List<Sort.Order> orders;

    if (null == this.sorts || this.sorts.isEmpty()) {
      orders = List.of();
    } else {
      orders = this.sorts.stream()
          .map(field -> {
            String property = field.property();
            Sort.Direction direction = Sort.DEFAULT_DIRECTION;
            if (null != field.direction()) {
              String directionString = field.direction();
              direction = Sort.Direction.fromOptionalString(directionString).orElse(Sort.DEFAULT_DIRECTION);
            }
            return new Sort.Order(direction, property);
          }).toList();
    }

    return Sort.by(orders);
  }

  public enum FilterMode {
    and,
    or
  }

  public enum FilterOperator {
    eq
  }

  @Data
  public static class FilterGroup {
    private FilterMode mode; // Between filters
    private List<Filter> filters;
  }

  @Data
  public static class Filter {
    private String key;
    private FilterMode mode; // Between values: name = name1 OR name = name2
    private List<String> values;
    private FilterOperator operator;
  }
}
