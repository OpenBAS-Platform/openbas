package io.openbas.database.model;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark a resource type that can be granted permissions. This is used to link a class
 * to an RBAC ResourceType and to specify on which Grant field the link is done. For example, for
 * the Scenario class, the annotation would be: @Grantable(grantFieldName = "scenario"). Where
 * "scenario" is the name of the field in the Grant entity that corresponds to this resource type.
 */
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
