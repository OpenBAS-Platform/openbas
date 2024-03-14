package io.openbas.utils.pagination;

import io.openbas.utils.schema.PropertySchema;
import io.openbas.utils.schema.SchemaUtils;

import java.lang.reflect.Field;
import java.util.*;
import java.util.function.Predicate;

public class SearchUtils {

  @SuppressWarnings("unchecked")
  public static Predicate<Object> computeSearch(PaginationField input) {
    String search = Optional.ofNullable(input.getTextSearch()).orElse("").toLowerCase();

    return (value) -> {
      List<PropertySchema> propertySchemas = SchemaUtils.schema(value.getClass());
      List<PropertySchema> searchableProperties = getSearchableProperties(propertySchemas);
      List<Object> values = getSearchableValues(value, searchableProperties);

      return values.stream()
          .anyMatch(v -> {
            if (v.getClass().isAssignableFrom(Map.class)
                || v.getClass().getName().contains("ImmutableCollections")) {
              return ((Map) v).values()
                  .stream()
                  .anyMatch(mapValue -> containsText(mapValue, search));
            } else if (v.getClass().isAssignableFrom(String.class)) {
              return containsText(v, search);
            } else {
              throw new UnsupportedOperationException(
                  "Searching is not implemented for other property than Map and String");
            }
          });
    };
  }

  private static boolean containsText(Object value, String text) {
    return ((String) value).toLowerCase().contains(text);
  }

  private static List<Object> getSearchableValues(Object obj, List<PropertySchema> propertySchemas) {
    if (propertySchemas.isEmpty()) {
      return Collections.emptyList();
    }

    List<Object> values = new ArrayList<>();

    Field field;
    try {
      for (PropertySchema propertySchema : propertySchemas) {
        field = obj.getClass().getDeclaredField(propertySchema.getName());
        field.setAccessible(true);
        List<PropertySchema> properties = getSearchableProperties(propertySchema.getPropertiesSchema());
        // Search on children
        if (!properties.isEmpty()) {
          values.addAll(getSearchableValues(field.get(obj), properties));
          // Return leaf
        } else {
          values.add(field.get(obj));
        }
      }
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(e);
    }
    return values;
  }

  private static List<PropertySchema> getSearchableProperties(List<PropertySchema> propertySchemas) {
    return propertySchemas.stream().filter(PropertySchema::isSearchable).toList();
  }

}
