package io.openex.config;

import io.openex.database.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;

import javax.servlet.http.HttpSession;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@Configuration
public class SessionManager {

    private static final Map<String, HttpSession> sessions = new HashMap<>();

    @Bean
    public HttpSessionListener httpSessionListener() {
        return new HttpSessionListener() {
            @Override
            public void sessionCreated(HttpSessionEvent hse) {
                sessions.put(hse.getSession().getId(), hse.getSession());
            }

            @Override
            public void sessionDestroyed(HttpSessionEvent hse) {
                sessions.remove(hse.getSession().getId());
            }
        };
    }

    private Optional<SecurityContext> extractSecurityContext(HttpSession httpSession) {
        Object securityContext = httpSession.getAttribute(SPRING_SECURITY_CONTEXT_KEY);
        if (securityContext instanceof SecurityContext secContext) {
            return Optional.of(secContext);
        }
        return Optional.empty();
    }

    private Optional<Authentication> extractAuthentication(HttpSession httpSession) {
        Optional<SecurityContext> securityContext = extractSecurityContext(httpSession);
        if (securityContext.isPresent()) {
            Authentication authentication = securityContext.get().getAuthentication();
            return Optional.of(authentication);
        }
        return Optional.empty();
    }

    private Optional<User> extractPrincipal(HttpSession httpSession) {
        Optional<Authentication> authentication = extractAuthentication(httpSession);
        if (authentication.isPresent()) {
            Object principal = authentication.get().getPrincipal();
            if (principal instanceof User user) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    private Stream<HttpSession> getUserSessions(String userId) {
        return sessions.values().stream().filter(httpSession -> {
            Optional<User> extractPrincipal = extractPrincipal(httpSession);
            return extractPrincipal.map(user -> user.getId().equals(userId)).orElse(false);
        });
    }

    public boolean isSessionAvailable(String sessionId) {
        return sessions.containsKey(sessionId);
    }

    public void refreshUserSessions(User user) {
        getUserSessions(user.getId()).forEach(httpSession -> {
            Optional<SecurityContext> context = extractSecurityContext(httpSession);
            Optional<Authentication> auth = extractAuthentication(httpSession);
            if (context.isPresent() && auth.isPresent()) {
                Authentication authentication = auth.get();
                SecurityContext securityContext = context.get();
                if (authentication instanceof OAuth2AuthenticationToken oauth) {
                    Authentication newAuth = new OAuth2AuthenticationToken(
                            user, user.getAuthorities(), oauth.getAuthorizedClientRegistrationId());
                    securityContext.setAuthentication(newAuth);
                } else if (authentication instanceof PreAuthenticatedAuthenticationToken) {
                    Authentication newAuth = new PreAuthenticatedAuthenticationToken(
                            user, user.getPassword(), user.getAuthorities());
                    securityContext.setAuthentication(newAuth);
                }
            }
        });
    }

    public void invalidateUserSession(String userId) {
        getUserSessions(userId).forEach(HttpSession::invalidate);
    }
}