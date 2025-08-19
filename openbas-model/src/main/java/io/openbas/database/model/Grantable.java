package io.openbas.database.model;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Grantable {
  /**
   * The name of the field in Grant entity that corresponds to this resource type.
   *
   * @return the associated grant field name
   */
  String grantFieldName();
}
