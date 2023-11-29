package io.openex.helper;

import io.openex.model.PropertySchema;
import org.hibernate.exception.SQLGrammarException;

import javax.annotation.Nullable;
import javax.persistence.Column;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.*;

public class SchemaHelper {

  private static final List<Class<?>> REQUIRED_ANNOTATIONS = List.of(
      NotNull.class,
      NotBlank.class,
      Email.class
  );

  /**
   * Build schema for a specific class
   */
  // TODO: need to be cache
  public static List<PropertySchema> schema(@NotNull final Class<?> clazz) {
    Field[] fields = clazz.getDeclaredFields();
    return Arrays.stream(fields).map(field -> {
      PropertySchema.PropertySchemaBuilder builder = PropertySchema.builder()
          .name(field.getName()) // Name
          .type(field.getType()) // Type
          .multiple(field.getType().isArray() || Collection.class.isAssignableFrom(field.getType())); // Cardinality

      Annotation[] annotations = field.getDeclaredAnnotations();
      for (Annotation annotation : annotations) {
        // Unicity
        if (annotation.annotationType().equals(Column.class)) {
          builder.unicity(((Column) annotation).unique());
        }
        // Required
        if (REQUIRED_ANNOTATIONS.contains(annotation.annotationType())) {
          builder.mandatory(true);
        }
      }
      return builder.build();
    }).toList();
  }

  /**
   * Set property value based on introspection
   */
  public static void setPropertyValue(
      @NotNull final Class<?> clazz,
      @NotBlank final String propertyName,
      @NotNull final Object objectToFill,
      @NotNull final Object value) {
    Field field;
    try {
      field = clazz.getDeclaredField(propertyName);
      field.setAccessible(true);
      field.set(objectToFill, value);
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Get property value based on introspection
   */
  public static Object getPropertyValue(
      @NotNull final Class<?> clazz,
      @NotBlank final String propertyName,
      @NotNull final Object object) {
    Field field;
    try {
      field = clazz.getDeclaredField(propertyName);
      field.setAccessible(true);
      return field.get(object);
    } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new RuntimeException(e);
    }
  }

  /**
   * Get property value list based on introspection
   */
  @SuppressWarnings("unchecked")
  private static List<Object> getPropertyValueList(
      @NotNull final Class<?> clazz,
      @NotBlank final String propertyName,
      @NotNull final Object object) {
    Object leftValue = SchemaHelper.getPropertyValue(clazz, propertyName, object);
    if (leftValue != null && !(leftValue instanceof List)) {
      throw new IllegalArgumentException(
          "Property type is not valid for multiple property : " + leftValue.getClass());
    }
    if (leftValue == null) {
      leftValue = new ArrayList<>();
    }
    return (List<Object>) leftValue;
  }

  public static <T> PropertySchema getUniqueProperty(@NotNull final T input) {
    List<PropertySchema> jsonSchemas = SchemaHelper.schema(input.getClass());
    assert jsonSchemas != null;
    List<PropertySchema> uniqueProperties = jsonSchemas.stream()
        .filter(PropertySchema::isUnicity)
        .toList();

    if (uniqueProperties.size() > 1) {
      throw new IllegalArgumentException("Not supported for now");
    } else if (uniqueProperties.size() == 1) {
      return uniqueProperties.get(0);
    } else {
      return null;
    }
  }

  public static <T> List<PropertySchema> getMultipleProperties(@NotNull final T input) {
    List<PropertySchema> jsonSchemas = SchemaHelper.schema(input.getClass());
    assert jsonSchemas != null;
    return jsonSchemas.stream()
        .filter(PropertySchema::isMultiple)
        .toList();
  }

  public static <T> List<T> find(
      @Nullable final List<T> inputs,
      @NotNull T input,
      @Nullable final PropertySchema uniqueProperty) {
    if (uniqueProperty == null || inputs == null) {
      return List.of();
    }
    final String uniquePropertyName = uniqueProperty.getName();
    final Object uniquePropertyValue = SchemaHelper.getPropertyValue(input.getClass(), uniquePropertyName, input);

    // Find equal objects
    return inputs.stream()
        .filter((i) -> {
          Object value = SchemaHelper.getPropertyValue(input.getClass(), uniquePropertyName, i);
          return uniquePropertyValue.equals(value);
        })
        .toList();
  }

  /**
   * Merge mechanism Handle only multiple properties for now
   */
  public static <T> T merge(@Nullable final List<T> inputs, @NotNull T input) {
    if (inputs == null) {
      return input;
    }

    PropertySchema uniqueProperty = getUniqueProperty(input);

    if (uniqueProperty != null) {
      // Find equal objects
      List<T> matches = find(inputs, input, uniqueProperty);

      if (matches.size() > 1) {
        throw new IllegalArgumentException("Not supported for now");
      } else if (matches.size() == 1) {
        T match = matches.get(0);

        // Merge multiple properties
        List<PropertySchema> multipleProperties = getMultipleProperties(input);
        try {
          multipleProperties.forEach((property) -> {
            List<Object> leftValue = SchemaHelper.getPropertyValueList(input.getClass(), property.getName(), match);
            List<Object> rightValue = SchemaHelper.getPropertyValueList(input.getClass(), property.getName(), input);
            leftValue.addAll(rightValue);
            if (!leftValue.isEmpty()) {
              SchemaHelper.setPropertyValue(input.getClass(), property.getName(), match, new ArrayList<>(new HashSet<>(leftValue)));
            }
          });
        } catch (SQLGrammarException e) {
          // TODO: handle SQLGrammarException
        }

        return match;
      } else {
        return input;
      }
    } else {
      return input;
    }
  }

}
