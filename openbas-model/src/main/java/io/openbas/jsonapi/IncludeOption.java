package io.openbas.jsonapi;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a field of an entity as an "optional include" in JSON:API exports.
 *
 * <p>By default, all relations or fields annotated with {@code @IncludeOption} can be dynamically
 * included or excluded from the serialized JSON:API response, based on the {@link
 * io.openbas.jsonapi.IncludeOptions} provided by the caller.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface IncludeOption {
  String key() default "";
}
