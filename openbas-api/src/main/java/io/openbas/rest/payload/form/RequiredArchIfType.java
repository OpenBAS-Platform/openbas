package io.openbas.rest.payload.form;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import io.openbas.database.model.Payload;
import jakarta.validation.Constraint;
import jakarta.validation.ReportAsSingleViolation;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

@Target(FIELD)
@Retention(RUNTIME)
@Constraint(validatedBy = ArchRequiredTypeValidator.class)
@ReportAsSingleViolation
public @interface RequiredArchIfType {
  String message() default "Architecture is required when type of Payload is Command or Executable";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

  String[] validTypes() default {};
}
