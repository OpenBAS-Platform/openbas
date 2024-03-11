package io.openbas.utils.mockUser;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import static io.openbas.utils.mockUser.WithMockAdminUserSecurityContextFactory.MOCK_USER_ADMIN_EMAIL;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockAdminUserSecurityContextFactory.class)
public @interface WithMockAdminUser {
    String email() default MOCK_USER_ADMIN_EMAIL;
}
