package io.openex.rest.utils;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import static io.openex.rest.utils.WithMockAdminUserSecurityContextFactory.MOCK_USER_ADMIN_EMAIL;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockAdminUserSecurityContextFactory.class)
public @interface WithMockAdminUser {
    String email() default MOCK_USER_ADMIN_EMAIL;
}
