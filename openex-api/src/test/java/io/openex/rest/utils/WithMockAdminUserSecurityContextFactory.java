package io.openex.rest.utils;

import io.openex.database.model.User;
import io.openex.database.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;
import org.springframework.stereotype.Component;

import static io.openex.service.UserService.buildAuthenticationToken;

@Component
public class WithMockAdminUserSecurityContextFactory implements WithSecurityContextFactory<WithMockAdminUser> {

    public static final String MOCK_USER_ADMIN_EMAIL = "admin@openbas.io";
    private static final String LANG_EN = "en";
    @Autowired
    private UserRepository userRepository;

    @Override
    public SecurityContext createSecurityContext(WithMockAdminUser customUser) {
        User user = this.userRepository.findByEmailIgnoreCase(customUser.email()).orElseThrow();
        Authentication authentication = buildAuthenticationToken(user);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        return context;
    }

    @PostConstruct
    private void postConstruct() {
        this.createAdminMockUser();
    }

    @PreDestroy
    public void preDestroy() {
        this.userRepository.deleteById(this.userRepository.findByEmailIgnoreCase(MOCK_USER_ADMIN_EMAIL).orElseThrow().getId());
    }

    private void createAdminMockUser() {
        if (this.userRepository.findByEmailIgnoreCase(MOCK_USER_ADMIN_EMAIL).isPresent()) {
            return;
        }
        // Create user
        User user = new User();
        user.setEmail(MOCK_USER_ADMIN_EMAIL);
        user.setLang(LANG_EN);
        user.setAdmin(true);
        this.userRepository.save(user);
    }
}
