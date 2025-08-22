package io.openbas.database.model;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Grantable {
  /**
   * @return the GRANT_RESOURCE_TYPE associated with the annotated class
   */
  Grant.GRANT_RESOURCE_TYPE value();
}
