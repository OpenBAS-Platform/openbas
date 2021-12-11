package io.openex.player.rest.user;

import io.openex.player.config.OpenExConfig;
import io.openex.player.model.database.Token;
import io.openex.player.model.database.User;
import io.openex.player.repository.UserRepository;
import io.openex.player.rest.helper.RestBehavior;
import io.openex.player.rest.user.form.LoginInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Nullable;
import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.time.Duration;
import java.util.Optional;

import static io.openex.player.model.database.User.ROLE_USER;

@RestController
public class UserApi extends RestBehavior {

    private UserRepository userRepository;
    private OpenExConfig openExConfig;

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setOpenExConfig(OpenExConfig openExConfig) {
        this.openExConfig = openExConfig;
    }

    @RolesAllowed(ROLE_USER)
    @GetMapping("/api/me")
    public User me() {
        return userRepository.findById(currentUser().getId()).orElseThrow();
    }

    @RolesAllowed(ROLE_USER)
    @GetMapping("/api/users")
    public Iterable<User> users() {
        return userRepository.findAll();
    }

    @GetMapping("/api/parameters")
    public OpenExConfig parameter() {
        return openExConfig;
    }

    private ResponseCookie buildCookie(String value, @Nullable String duration) {
        return ResponseCookie
                .from(openExConfig.getCookieName(), value)
                .secure(openExConfig.isCookieSecure())
                .path("/")
                .maxAge(duration != null ? Duration.parse(duration).getSeconds() : 0)
                .httpOnly(true).sameSite(null).build();
    }

    @RolesAllowed(ROLE_USER)
    @GetMapping("/api/logout")
    public ResponseEntity<Object> logout() {
        ResponseCookie springCookie = buildCookie("logout", null);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, springCookie.toString())
                .build();
    }

    @PostMapping("/api/login")
    public ResponseEntity<User> login(@Valid @RequestBody LoginInput login) {
        Optional<User> optionalUser = userRepository.findByEmail(login.getLogin());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            Argon2PasswordEncoder passwordEncoder = new Argon2PasswordEncoder();
            if (passwordEncoder.matches(login.getPassword(), user.getPassword())) {
                Optional<Token> token = user.getTokens().stream().findFirst();
                if (token.isPresent()) {
                    ResponseCookie springCookie = buildCookie(token.get().getValue(), openExConfig.getCookieDuration());
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, springCookie.toString())
                            .body(user);
                }
            }
        }
        throw new AccessDeniedException("Invalid credentials");
    }
}
