package io.openbas.utils.schema;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.annotation.Filterable;
import io.openbas.annotation.Searchable;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class SchemaUtils {

  private static final List<Class<?>> REQUIRED_ANNOTATIONS = List.of(
      NotNull.class,
      NotBlank.class,
      Email.class
  );

  private static final Class<?>[] BASE_CLASSES = {
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
  public static List<PropertySchema> schema(@NotNull final Class<?> clazz) {
    List<PropertySchema> properties = cacheMap.get(clazz);

    if (properties == null) {
      Field[] fields = clazz.getDeclaredFields();
      properties = Arrays.stream(fields).map(field -> {
        PropertySchema.PropertySchemaBuilder builder = PropertySchema.builder()
            .name(field.getName())
            .type(field.getType())
            .multiple(field.getType().isArray() || Collection.class.isAssignableFrom(field.getType()));

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
          // Searchable
          if (annotation.annotationType().equals(Searchable.class)) {
            builder.searchable(true);
          }
          // Filterable
          if (annotation.annotationType().equals(Filterable.class)) {
            builder.filterable(true);
          }
        }

        // Deep object
        if (Arrays.stream(BASE_CLASSES).noneMatch(c -> c.equals(field.getType()))) {
          // FIXME: not handling loop property but prevent it for now
          // Exemple: Object A { private Object A; }
          if (!field.getType().equals(clazz)) {
            List<PropertySchema> propertiesSchema = schema(field.getType());
            builder.propertiesSchema(propertiesSchema);
          }
        }

        return builder.build();
      }).toList();
      cacheMap.put(clazz, properties);
    }

    return properties;
  }

  @SuppressWarnings("unchecked")
  public static Map.Entry<Class<Object>, Object> getPropertyInfo(Object obj, String path) {
    if (obj == null) {
      return null;
    }
    String[] pathParts = path.split("\\.");

    Object currentObject = obj;
    for (String pathPart : pathParts) {
      Field field;
      try {
        field = currentObject.getClass().getDeclaredField(pathPart);
        field.setAccessible(true);
        currentObject = field.get(currentObject);
        if (currentObject == null) {
          return null;
        }
      } catch (NoSuchFieldException | IllegalAccessException e) {
        throw new RuntimeException(e);
      }
    }
    return Map.entry((Class<Object>) currentObject.getClass(), currentObject);
  }

  public static <T> String toJavaFieldPath(Class<T> clazz, String jsonFieldPath) {
    String[] pathParts = jsonFieldPath.split("\\.");

    List<String> realPaths = new ArrayList<>();
    List<PropertySchema> propertySchemas = SchemaUtils.schema(clazz);

    for (String pathPart : pathParts) {
      PropertySchema propertySchema = propertySchemas.stream()
          .filter(p -> pathPart.equals(p.getJsonName()))
          .findFirst()
          .orElseThrow();
      realPaths.add(propertySchema.getName());
      propertySchemas = propertySchema.getPropertiesSchema();
    }
    return String.join(".", realPaths);
  }

}
