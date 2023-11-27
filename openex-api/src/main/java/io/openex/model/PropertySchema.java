package io.openex.model;

import lombok.Builder;
import lombok.Getter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import static org.apache.commons.lang3.StringUtils.isBlank;

@Builder
@Getter
public class PropertySchema {

  @NotBlank
  private final String name;

  @NotNull
  private final Class<?> type;

  private final boolean unicity;

  private final boolean mandatory;

  private final boolean multiple;

  // -- VALIDATION --

  public static PropertySchemaBuilder builder() {
    return new ValidationBuilder();
  }

  private static class ValidationBuilder extends PropertySchemaBuilder {

    public PropertySchema build() {
      if (isBlank(super.name)) {
        throw new RuntimeException("Property name should not be empty");
      }
      if (super.type == null) {
        throw new RuntimeException("Property type should not be empty");
      }

      return super.build();
    }
  }

}

