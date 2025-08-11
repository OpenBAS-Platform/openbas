package io.openbas.utils.mockUser;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import static io.openbas.utils.mockUser.WithMockUserFullPermissionsSecurityContextFactory.MOCK_USER_FULL_PERMISSION_EMAIL;


@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockUserFullPermissionsSecurityContextFactory.class)
public @interface WithMockUserFullPermissions {
  String email() default MOCK_USER_FULL_PERMISSION_EMAIL;
}
