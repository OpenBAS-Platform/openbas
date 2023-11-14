package io.openex.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.model.PropertyJsonSchema;
import io.openex.model.PropertyJsonSchema.PropertyJsonSchemaBuilder;
import org.springframework.stereotype.Service;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Service
public class MappingService {

  private final List<Class<?>> requiredAnnotations = List.of(
      NotNull.class,
      NotBlank.class,
      Email.class
  );

  public List<PropertyJsonSchema> jsonSchema(@NotNull final Class<?> clazz) {
    Field[] fields = clazz.getDeclaredFields();
    return Arrays.stream(fields).map(field -> {
      PropertyJsonSchemaBuilder builder = PropertyJsonSchema.builder()
          .type(field.getType()) // type
          .multiple(field.getType().isArray() || Collection.class.isAssignableFrom(field.getType())); // Cardinality

      Annotation[] annotations = field.getDeclaredAnnotations();
      for (Annotation annotation : annotations) {
        // Name
        if (annotation.annotationType().equals(JsonProperty.class)) {
          builder.name(((JsonProperty) annotation).value());
        }
        // Required
        if (this.requiredAnnotations.contains(annotation.annotationType())) {
          builder.mandatory(true);
        }
      }
      return builder.build();
    }).toList();
  }

}
