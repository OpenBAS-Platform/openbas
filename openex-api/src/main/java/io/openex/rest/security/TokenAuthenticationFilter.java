package io.openex.rest.security;

import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.TokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static io.openex.database.model.User.*;
import static java.util.Optional.ofNullable;
import static org.springframework.util.StringUtils.hasLength;

public class TokenAuthenticationFilter extends GenericFilterBean {

    private static final String COOKIE_NAME = "openex_token";
    private static final String TOKEN_NAME = "X-Authorization-Token";
    private TokenRepository tokenRepository;

    @Autowired
    public void setTokenRepository(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // Extract from request
        HttpServletRequest request = ((HttpServletRequest) servletRequest);
        SecurityContext userContext = SecurityContextHolder.getContext();
        if (userContext.getAuthentication() == null) {
            String header = request.getHeader(TOKEN_NAME);
            Cookie[] cookies = ofNullable(request.getCookies()).orElse(new Cookie[0]);
            Optional<Cookie> defaultCookie = Arrays.stream(cookies)
                    .filter(cookie -> COOKIE_NAME.equals(cookie.getName())).findFirst();
            String authenticationToken = hasLength(header) ? header :
                    defaultCookie.orElseGet(() -> new Cookie(COOKIE_NAME, null)).getValue();
            Optional<Token> token = tokenRepository.findByValue(authenticationToken);
            if (token.isPresent()) {
                User user = token.get().getUser();
                List<SimpleGrantedAuthority> roles = new ArrayList<>();
                roles.add(new SimpleGrantedAuthority(ROLE_USER));
                if (user.isAdmin()) {
                    roles.add(new SimpleGrantedAuthority(ROLE_ADMIN));
                }
                if (user.isAdmin() || user.isPlanificateur()) {
                    roles.add(new SimpleGrantedAuthority(ROLE_PLANIFICATEUR));
                }
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(new PreAuthenticatedAuthenticationToken(user, "", roles));
                SecurityContextHolder.setContext(context);
            }
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }
}