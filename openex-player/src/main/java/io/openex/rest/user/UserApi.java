package io.openex.rest.user;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.UserRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.LoginInput;
import io.openex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.Optional;

import static io.openex.database.model.User.ROLE_USER;

@RestController
public class UserApi extends RestBehavior {

    private UserRepository userRepository;
    private UserService userService;
    private OpenExConfig openExConfig;

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

    @RolesAllowed(ROLE_USER)
    @GetMapping("/api/logout")
    public ResponseEntity<Object> logout() {
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, userService.buildLogoutCookie()).build();
    }

    @PostMapping("/api/login")
    public ResponseEntity<User> login(@Valid @RequestBody LoginInput login) {
        Optional<User> optionalUser = userRepository.findByEmail(login.getLogin());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (userService.isUserPasswordValid(user, login.getPassword())) {
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
}
