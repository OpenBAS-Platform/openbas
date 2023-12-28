package io.openex.annotation;

import io.openex.validator.Ipv4OrIpv6Validator;

import javax.validation.Constraint;
import javax.validation.Payload;
import javax.validation.ReportAsSingleViolation;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target(FIELD)
@Retention(RUNTIME)
@Constraint(validatedBy = Ipv4OrIpv6Validator.class)
@ReportAsSingleViolation
public @interface Ipv4OrIpv6Constraint {
    String message() default "must be ipv4 or ipv6";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
