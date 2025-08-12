package io.openbas.utils.mockUser;

import static io.openbas.utils.mockUser.WithMockUserFullPermissionsSecurityContextFactory.MOCK_USER_FULL_PERMISSION_EMAIL;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.security.test.context.support.WithSecurityContext;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockUserFullPermissionsSecurityContextFactory.class)
public @interface WithMockUserFullPermissions {
  String email() default MOCK_USER_FULL_PERMISSION_EMAIL;
}
