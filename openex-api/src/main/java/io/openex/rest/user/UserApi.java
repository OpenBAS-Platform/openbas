package io.openex.rest.user;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.TokenRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.LoginInput;
import io.openex.rest.user.form.PasswordInput;
import io.openex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

import static io.openex.config.AppConfig.currentUser;
import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.database.specification.TokenSpecification.fromUser;

@RestController
public class UserApi extends RestBehavior {

    private UserRepository userRepository;
    private TokenRepository tokenRepository;
    private UserService userService;
    private OpenExConfig openExConfig;

    @Autowired
    public void setTokenRepository(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setOpenExConfig(OpenExConfig openExConfig) {
        this.openExConfig = openExConfig;
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

    @RolesAllowed(ROLE_USER)
    @GetMapping("/api/logout")
    public ResponseEntity<Object> logout() {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, userService.buildLogoutCookie()).build();
    }

    @PostMapping("/api/login")
    public ResponseEntity<User> login(@Valid @RequestBody LoginInput input) {
        Optional<User> optionalUser = userRepository.findByEmail(input.getLogin());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (userService.isUserPasswordValid(user, input.getPassword())) {
                Optional<Token> token = user.getTokens().stream().findFirst();
                if (token.isPresent()) {
                    return ResponseEntity.ok()
                            .header(HttpHeaders.SET_COOKIE, userService.buildLoginCookie(token.get().getValue()))
                            .body(user);
                }
            }
        }
        throw new AccessDeniedException("Invalid credentials");
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/users/{userId}/password")
    public User changePassword(@PathVariable String userId, @Valid @RequestBody PasswordInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPassword(userService.encodeUserPassword(input.getPassword()));
        return userRepository.save(user);
    }

    // region me
    @RolesAllowed(ROLE_USER)
    @GetMapping("/api/me")
    public User me() {
        return userRepository.findById(currentUser().getId()).orElseThrow();
    }

    @RolesAllowed(ROLE_USER)
    @GetMapping("/api/me/tokens")
    public List<Token> tokens() {
        return tokenRepository.findAll(fromUser(currentUser().getId()));
    }

    @RolesAllowed(ROLE_USER)
    @PutMapping("/api/me/password")
    public User changeMyPassword(@Valid @RequestBody PasswordInput input) {
        User currentUser = currentUser();
        User user = userRepository.findById(currentUser.getId()).orElseThrow();
        user.setPassword(userService.encodeUserPassword(input.getPassword()));
        return userRepository.save(user);
    }
    // endregion
}
