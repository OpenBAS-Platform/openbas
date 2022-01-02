package io.openex.service;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.TokenRepository;
import io.openex.database.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.annotation.Nullable;
import java.time.Duration;
import java.util.Date;
import java.util.UUID;

@Component
public class UserService {

    private final Argon2PasswordEncoder passwordEncoder = new Argon2PasswordEncoder();
    private UserRepository userRepository;
    private TokenRepository tokenRepository;
    private OpenExConfig openExConfig;

    @Autowired
    public void setOpenExConfig(OpenExConfig openExConfig) {
        this.openExConfig = openExConfig;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setTokenRepository(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    // region cookies
    private ResponseCookie buildCookie(String value, @Nullable String duration) {
        return ResponseCookie
                .from(openExConfig.getCookieName(), value)
                .secure(openExConfig.isCookieSecure())
                .path("/")
                .maxAge(duration != null ? Duration.parse(duration).getSeconds() : 0)
                .httpOnly(true).sameSite(null).build();
    }

    public String buildLoginCookie(String value) {
        return buildCookie(value, openExConfig.getCookieDuration()).toString();
    }

    public String buildLogoutCookie() {
        return buildCookie("logout", null).toString();
    }
    // endregion

    // region users
    public boolean isUserPasswordValid(User user, String password) {
        return passwordEncoder.matches(password, user.getPassword());
    }

    public String encodeUserPassword(String password) {
        return passwordEncoder.encode(password);
    }

    public void createUserToken(User user) {
        Token token = new Token();
        token.setUser(user);
        token.setCreated(new Date());
        token.setValue(UUID.randomUUID().toString());
        tokenRepository.save(token);
    }

    public User createUser(String email, String firstName, String lastName) {
        User user = new User();
        user.setEmail(email);
        user.setFirstname(firstName);
        user.setLastname(lastName);
        user.setStatus((short) 0);
        User savedUser = userRepository.save(user);
        // Create default token
        createUserToken(savedUser);
        return user;
    }
    // endregion
}
