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

  private SchemaUtils() {

  }

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

  // -- SCHEMA --

  public static List<PropertySchema> schema(@NotNull Class<?> clazz) {
    List<PropertySchema> properties = cacheMap.get(clazz);

    if (properties == null) {
      Field[] fields = clazz.getDeclaredFields();
      properties = new ArrayList<>(computeProperties(fields));

      while (clazz.getSuperclass() != null) {
        clazz = clazz.getSuperclass();
        fields = clazz.getDeclaredFields();
        properties.addAll(computeProperties(fields));
      }

      cacheMap.put(clazz, properties);
    }

    return properties;
  }

  // -- PROPERTIES --

  private static List<PropertySchema> computeProperties(
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
      if (field.getType().isArray() && field.getType().getComponentType().isEnum()) {
        Object[] enumValues = field.getType().getComponentType().getEnumConstants();
        List<String> enumNames = new ArrayList<>();
        for (Object enumValue : enumValues) {
          enumNames.add(enumValue.toString());
        }
        builder.availableValues(enumNames);
      }

      Annotation[] annotations = field.getDeclaredAnnotations();
      for (Annotation annotation : annotations) {
        // Json property name
        computeJsonName(builder, annotation);
        // Unicity
        computeUnicity(builder, annotation);
        // Required
        computeRequired(builder, annotation);
        // Queryable
        computeQueryable(builder, annotation, field);
        // Join table
        computeJoinTable(builder, annotation, field);
      }

      return builder.build();
    }).toList();
  }

  public static PropertySchema retrieveProperty(List<PropertySchema> propertySchemas, String jsonFieldPath) {
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

  // -- PRIVATE --

  private static void computeJsonName(
      @NotNull final PropertySchema.PropertySchemaBuilder builder,
      @NotNull final Annotation annotation) {
    if (annotation.annotationType().equals(JsonProperty.class)) {
      builder.jsonName(((JsonProperty) annotation).value());
    }
  }

  private static void computeUnicity(
      @NotNull final PropertySchema.PropertySchemaBuilder builder,
      @NotNull final Annotation annotation) {
    if (annotation.annotationType().equals(Column.class)) {
      builder.unicity(((Column) annotation).unique());
    }
  }

  private static void computeRequired(
      @NotNull final PropertySchema.PropertySchemaBuilder builder,
      @NotNull final Annotation annotation) {
    if (REQUIRED_ANNOTATIONS.contains(annotation.annotationType())) {
      builder.mandatory(true);
    }
  }

  private static void computeQueryable(
      @NotNull final PropertySchema.PropertySchemaBuilder builder,
      @NotNull final Annotation annotation,
      @NotNull final Field field) {
    if (annotation.annotationType().equals(Queryable.class)) {
      Queryable queryable = field.getAnnotation(Queryable.class);
      builder.searchable(queryable.searchable());
      builder.filterable(queryable.filterable());
      builder.dynamicValues(queryable.dynamicValues());
      builder.sortable(queryable.sortable());
      String propertyValue = queryable.property();
      if (hasText(propertyValue)) {
        builder.propertyRepresentative(propertyValue);
      }
    }
  }

  private static void computeJoinTable(
      @NotNull final PropertySchema.PropertySchemaBuilder builder,
      @NotNull final Annotation annotation,
      @NotNull final Field field) {
    if (annotation.annotationType().equals(JoinTable.class)) {
      PropertySchema.JoinTable joinTableProperty = PropertySchema.JoinTable.builder()
          .joinOn(field.getName())
          .build();
      builder.joinTable(joinTableProperty);
    }
  }

}
