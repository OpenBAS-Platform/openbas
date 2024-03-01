package io.openbas.utils.mockUser;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import static io.openbas.utils.mockUser.WithMockObserverUserSecurityContextFactory.MOCK_USER_OBSERVER_EMAIL;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockObserverUserSecurityContextFactory.class)
public @interface WithMockObserverUser {
    String email() default MOCK_USER_OBSERVER_EMAIL;
}
