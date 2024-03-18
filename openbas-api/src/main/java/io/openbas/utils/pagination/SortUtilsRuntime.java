package io.openbas.utils.pagination;

import io.openbas.helper.SupportedLanguage;
import io.openbas.utils.schema.PropertySchema;
import io.openbas.utils.schema.SchemaUtils;
import org.springframework.data.domain.Sort;

import javax.annotation.Nullable;
import java.lang.reflect.Field;
import java.util.*;
import java.util.Map.Entry;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.utils.schema.SchemaUtils.*;
import static java.util.Comparator.comparing;
import static org.springframework.util.StringUtils.hasText;

public class SortUtilsRuntime {

  public static Sort toSortRuntime(@Nullable final List<SortField> sorts) {
    List<Sort.Order> orders;

    if (sorts == null || sorts.isEmpty()) {
      orders = List.of();
    } else {
      orders = sorts.stream()
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

  public static Comparator<Object> computeSortRuntime(@Nullable final List<SortField> sorts) {
    Sort sort = toSortRuntime(sorts);

    Comparator<Object> comparator = (a, b) -> 0;

    for (Sort.Order order : sort) {
      Comparator<Object> propertyComparator = comparing(
          value -> {
            List<PropertySchema> propertySchemas = SchemaUtils.schema(value.getClass());
            List<PropertySchema> filterableProperties = getSortableProperties(propertySchemas);
            PropertySchema sortableProperty = retrieveProperty(filterableProperties, order.getProperty());
            Entry<Class<Object>, Object> entry = getPropertyInfo(value, sortableProperty);
            return getPropertyValue(entry);
          });

      comparator = comparator.thenComparing(
          order.getDirection().equals(Sort.Direction.ASC)
              ? propertyComparator
              : propertyComparator.reversed()
      );
    }

    return comparator;
  }

  private static final Comparable<Object> EMPTY_COMPARABLE = o -> 0;

  @SuppressWarnings("unchecked")
  private static Comparable<Object> getPropertyValue(Entry<Class<Object>, Object> entry) {
    if (entry == null || entry.getValue() == null) {
      return EMPTY_COMPARABLE;
    }
    if (Arrays.stream(BASE_CLASSES).anyMatch(c -> entry.getKey().isAssignableFrom(c))) {
      return (Comparable<Object>) entry.getValue();
      // Handle map with Supported language
    } else if (entry.getKey().isAssignableFrom(Map.class)
        || entry.getKey().getName().contains("ImmutableCollections")) {
      Set<Map.Entry> entries = ((Map) entry.getValue()).entrySet();
      if (entries.stream().anyMatch(e -> e.getKey().getClass().isAssignableFrom(SupportedLanguage.class))) {
        SupportedLanguage lang = SupportedLanguage.of(currentUser().getLang());
        return (Comparable<Object>) entries.stream()
            .filter(e -> lang.equals(e.getKey()))
            .findFirst()
            .map(Entry::getValue)
            .orElse(EMPTY_COMPARABLE);
      } else {
        return EMPTY_COMPARABLE;
      }
    } else {
      throw new UnsupportedOperationException("Sorting is not implemented for other property than String and Long");
    }
  }

  @SuppressWarnings("unchecked")
  private static Map.Entry<Class<Object>, Object> getPropertyInfo(Object obj, PropertySchema propertySchema) {
    if (obj == null) {
      return null;
    }

    Field field;
    Object currentObject;
    try {
      field = obj.getClass().getDeclaredField(propertySchema.getName());
      field.setAccessible(true);

      // Search on child
      if (propertySchema.isSortable() && hasText(propertySchema.getPropertyRepresentative())) {
        Object childObj = field.get(obj);
        Field childField = childObj.getClass().getDeclaredField(propertySchema.getPropertyRepresentative());
        childField.setAccessible(true);
        currentObject = childField.get(childObj);
        // Direct property
      } else {
        currentObject = field.get(obj);
      }
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(e);
    }

    return Map.entry((Class<Object>) currentObject.getClass(), currentObject);
  }


}
