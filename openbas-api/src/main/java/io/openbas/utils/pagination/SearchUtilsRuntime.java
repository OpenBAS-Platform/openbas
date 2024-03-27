package io.openbas.utils.pagination;

import io.openbas.utils.schema.PropertySchema;
import io.openbas.utils.schema.SchemaUtils;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import javax.annotation.Nullable;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

import static io.openbas.utils.OperationUtilsRuntime.containsText;
import static io.openbas.utils.schema.SchemaUtils.getSearchableProperties;
import static org.springframework.util.StringUtils.hasText;

public class SearchUtilsRuntime {

  private static final Predicate<Object> EMPTY_PREDICATE = (value) -> true;

  public static Predicate<Object> computeSearchRuntime(@Nullable final String search) {
    if (!hasText(search)) {
      return EMPTY_PREDICATE;
    }

    return (value) -> {
      List<PropertySchema> propertySchemas = SchemaUtils.schema(value.getClass());
      List<PropertySchema> searchableProperties = getSearchableProperties(propertySchemas);
      List<Object> values = getSearchableValues(value, searchableProperties);
      return getPropertyValue(values, search);
    };
  }

  @SuppressWarnings("unchecked")
  private static boolean getPropertyValue(@NotNull final List<Object> values, @NotBlank final String search) {
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
  }

  /**
   * Search values on direct property and representative child
   */
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

        // Search on child
        if (propertySchema.isSearchable() && hasText(propertySchema.getPropertyRepresentative())) {
          Object childObj = field.get(obj);
          Field childField = childObj.getClass().getDeclaredField(propertySchema.getPropertyRepresentative());
          childField.setAccessible(true);
          values.add(childField.get(childObj));
          // Direct property
        } else {
          values.add(field.get(obj));
        }
      }
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(e);
    }
    return values;
  }

}
