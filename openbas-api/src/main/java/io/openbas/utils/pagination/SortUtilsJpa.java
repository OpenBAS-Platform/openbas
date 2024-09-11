package io.openbas.utils.pagination;

import io.openbas.utils.schema.PropertySchema;
import io.openbas.utils.schema.SchemaUtils;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Sort;

import javax.annotation.Nullable;
import java.util.List;

import static io.openbas.utils.schema.SchemaUtils.getSortableProperties;
import static org.springframework.util.StringUtils.hasText;

public class SortUtilsJpa {

  private SortUtilsJpa() {

  }

  public static <T> Sort toSortJpa(@Nullable final List<SortField> sorts, @NotNull final Class<T> clazz) {
    List<PropertySchema> propertySchemas = getSortableProperties(SchemaUtils.schema(clazz));

    List<Sort.Order> orders;

    if (sorts == null || sorts.isEmpty()) {
      orders = List.of();
    } else {
      orders = sorts.stream()
          .filter(s -> hasText(s.property()))
          .map(field -> {
            String property = field.property();
            Sort.Direction direction = Sort.DEFAULT_DIRECTION;
            if (null != field.direction()) {
              String directionString = field.direction();
              direction = Sort.Direction.fromOptionalString(directionString).orElse(Sort.DEFAULT_DIRECTION);
            }

            // Retrieve java name property
            String javaProperty = propertySchemas.stream()
                .filter(p -> p.getJsonName().equals(property))
                .findFirst()
                .map(PropertySchema::getName)
                .orElseThrow(() -> new IllegalArgumentException("Property not sortable: " + property + " for class " + clazz));
            return new Sort.Order(direction, javaProperty);
          }).toList();
    }

    return Sort.by(orders);
  }

}
