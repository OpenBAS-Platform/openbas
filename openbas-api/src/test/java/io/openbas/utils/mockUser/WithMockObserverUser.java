package io.openbas.utils.mockUser;

import static io.openbas.utils.mockUser.WithMockObserverUserSecurityContextFactory.MOCK_USER_OBSERVER_EMAIL;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.security.test.context.support.WithSecurityContext;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockObserverUserSecurityContextFactory.class)
public @interface WithMockObserverUser {
  String email() default MOCK_USER_OBSERVER_EMAIL;
}
