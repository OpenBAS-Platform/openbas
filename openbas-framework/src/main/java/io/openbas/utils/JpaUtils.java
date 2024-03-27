package io.openbas.utils;

import io.openbas.utils.schema.PropertySchema;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Root;
import jakarta.validation.constraints.NotNull;

import static org.springframework.util.StringUtils.hasText;

public class JpaUtils {

  public static <T> Expression<String> toPath(
      @NotNull final PropertySchema propertySchema,
      @NotNull final Root<T> root) {
    // Search on child
    if (propertySchema.isFilterable() && hasText(propertySchema.getPropertyRepresentative())) {
      return root.get(propertySchema.getName()).get(propertySchema.getPropertyRepresentative());
      // Direct property
    } else {
      return root.get(propertySchema.getName());
    }
  }

}
