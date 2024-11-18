package io.openbas.rest.payload.form;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;

public class ArchRequiredTypeValidator implements ConstraintValidator<RequiredArchIfType, Object> {
  private String[] validTypes;

  @Override
  public void initialize(RequiredArchIfType constraintAnnotation) {
    validTypes = constraintAnnotation.validTypes();
  }

  @Override
  public boolean isValid(Object value, ConstraintValidatorContext context) {
    if (value instanceof PayloadCreateInput) {
      PayloadCreateInput payload = (PayloadCreateInput) value;

      if (Arrays.asList(validTypes).contains(payload.getType())) {
        return payload.getExecutableArch() != null;
      }
    }

    return true;
  }
}
