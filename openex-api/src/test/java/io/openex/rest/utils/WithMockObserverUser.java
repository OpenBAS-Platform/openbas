package io.openex.rest.utils;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import static io.openex.rest.utils.WithMockObserverUserSecurityContextFactory.MOCK_USER_OBSERVER_EMAIL;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockObserverUserSecurityContextFactory.class)
public @interface WithMockObserverUser {
    String email() default MOCK_USER_OBSERVER_EMAIL;
}
