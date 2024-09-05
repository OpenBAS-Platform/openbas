package io.openbas.utils.mockUser;

import io.openbas.database.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.stereotype.Component;

import static io.openbas.service.UserService.buildAuthenticationToken;

@Component
public class WithMockAdminUserSecurityContextFactory implements WithSecurityContextFactory<WithMockAdminUser> {

    public static final String MOCK_USER_ADMIN_EMAIL = "admin-email@openbas.io";
    private static final String LANG_EN = "en";

    @Override
    public SecurityContext createSecurityContext(WithMockAdminUser customUser) {
        User user = new User();
        user.setEmail(MOCK_USER_ADMIN_EMAIL);
        user.setLang(LANG_EN);
        user.setAdmin(true);
        Authentication authentication = buildAuthenticationToken(user);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        return context;
    }
}
