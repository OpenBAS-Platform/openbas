package io.openbas.database.model;

import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Inherited
public @interface Grantable {
  /**
   * @return the GRANT_RESOURCE_TYPE associated with the annotated class
   */
  Grant.GRANT_RESOURCE_TYPE value();
}
