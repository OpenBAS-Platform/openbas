package io.openbas.utils.schema;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Queryable;
import jakarta.persistence.Column;
import jakarta.persistence.JoinTable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import static org.springframework.util.StringUtils.hasText;

public class SchemaUtils {

  private static final List<Class<?>> REQUIRED_ANNOTATIONS = List.of(
      NotNull.class,
      NotBlank.class,
      Email.class
  );

  public static final Class<?>[] BASE_CLASSES = {
      byte.class,
      short.class,
      int.class,
      long.class,
      float.class,
      double.class,
      char.class,
      boolean.class,
      Byte.class,
      Short.class,
      Integer.class,
      Long.class,
      Float.class,
      Double.class,
      Character.class,
      Boolean.class,
      String.class,
      Instant.class,
  };

  private static final ConcurrentHashMap<Class<?>, List<PropertySchema>> cacheMap = new ConcurrentHashMap<>();

  /**
   * Build schema for a specific class
   */
  public static List<PropertySchema> schema(@NotNull Class<?> clazz) {
    List<PropertySchema> properties = cacheMap.get(clazz);

    if (properties == null) {
      Field[] fields = clazz.getDeclaredFields();
      properties = new ArrayList<>(computeProperties(clazz, fields));

      while (clazz.getSuperclass() != null) {
        clazz = clazz.getSuperclass();
        fields = clazz.getDeclaredFields();
        properties.addAll(computeProperties(clazz, fields));
      }

      cacheMap.put(clazz, properties);
    }

    return properties;
  }

  private static List<PropertySchema> computeProperties(
      @NotNull final Class<?> clazz,
      @NotNull final Field[] fields) {
    return Arrays.stream(fields).map(field -> {
      PropertySchema.PropertySchemaBuilder builder = PropertySchema.builder()
          .name(field.getName())
          .type(field.getType())
          .multiple(field.getType().isArray() || Collection.class.isAssignableFrom(field.getType()));

      // Enum type -> compute available values
      if (field.getType().isEnum()) {
        Object[] enumValues = field.getType().getEnumConstants();
        List<String> enumNames = new ArrayList<>();
        for (Object enumValue : enumValues) {
          enumNames.add(enumValue.toString());
        }
        builder.availableValues(enumNames);
      }

      Annotation[] annotations = field.getDeclaredAnnotations();
      for (Annotation annotation : annotations) {
        // Json property name
        if (annotation.annotationType().equals(JsonProperty.class)) {
          builder.jsonName(((JsonProperty) annotation).value());
        }
        // Unicity
        if (annotation.annotationType().equals(Column.class)) {
          builder.unicity(((Column) annotation).unique());
        }
        // Required
        if (REQUIRED_ANNOTATIONS.contains(annotation.annotationType())) {
          builder.mandatory(true);
        }
        // Queryable
        if (annotation.annotationType().equals(Queryable.class)) {
          Queryable queryable = field.getAnnotation(Queryable.class);
          builder.searchable(queryable.searchable());
          builder.filterable(queryable.filterable());
          builder.sortable(queryable.sortable());
          String propertyValue = queryable.property();
          if (hasText(propertyValue)) {
            builder.propertyRepresentative(propertyValue);
          }
        }
        // Join table
        if (annotation.annotationType().equals(JoinTable.class)) {
          PropertySchema.JoinTable joinTableProperty = PropertySchema.JoinTable.builder()
              .joinOn(field.getName())
              .build();
          builder.joinTable(joinTableProperty);
        }
      }

      return builder.build();
    }).toList();
  }

  public static <T> PropertySchema retrieveProperty(List<PropertySchema> propertySchemas, String jsonFieldPath) {
    if (jsonFieldPath.contains("\\.")) {
      throw new IllegalArgumentException("Deep path is not allowed");
    }

    return propertySchemas.stream()
        .filter(p -> jsonFieldPath.equals(p.getJsonName()))
        .findFirst()
        .orElseThrow();
  }

  public static List<PropertySchema> getSearchableProperties(List<PropertySchema> propertySchemas) {
    return propertySchemas.stream().filter(PropertySchema::isSearchable).toList();
  }

  public static List<PropertySchema> getFilterableProperties(List<PropertySchema> propertySchemas) {
    return propertySchemas.stream().filter(PropertySchema::isFilterable).toList();
  }

  public static List<PropertySchema> getSortableProperties(List<PropertySchema> propertySchemas) {
    return propertySchemas.stream().filter(PropertySchema::isSortable).toList();
  }

}
