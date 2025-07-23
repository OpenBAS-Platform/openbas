package io.openbas.aop;

import io.openbas.database.model.Action;
import io.openbas.database.model.ResourceType;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RBAC {
  String resourceId() default "";

  Action requiredAction() default Action.SKIP_RBAC;

  ResourceType resourceType() default ResourceType.SKIP_RBAC;

  /**
   * The resource type for the RBAC check. If not specified, it will be derived from the
   * capabilities.
   */
  boolean skipRBAC() default false;
}
