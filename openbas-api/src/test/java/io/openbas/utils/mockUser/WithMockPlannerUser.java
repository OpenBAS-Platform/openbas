package io.openbas.utils.mockUser;

import static io.openbas.utils.mockUser.WithMockPlannerUserSecurityContextFactory.MOCK_USER_PLANNER_EMAIL;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.security.test.context.support.WithSecurityContext;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockPlannerUserSecurityContextFactory.class)
public @interface WithMockPlannerUser {
  String email() default MOCK_USER_PLANNER_EMAIL;
}
