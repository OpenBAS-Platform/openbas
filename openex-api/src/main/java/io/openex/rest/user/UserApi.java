package io.openex.rest.user;

import io.openex.config.OpenExConfig;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.OrganizationRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.LoginUserInput;
import io.openex.rest.user.form.UpdatePasswordInput;
import io.openex.rest.user.form.CreateUserInput;
import io.openex.rest.user.form.UpdateUserInput;
import io.openex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.validation.Valid;
import java.util.Optional;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.DatabaseHelper.updateRelationResolver;

@RestController
public class UserApi extends RestBehavior {

    private OrganizationRepository organizationRepository;
    private UserRepository userRepository;
    private UserService userService;
    private OpenExConfig openExConfig;

    @Autowired
    public void setOrganizationRepository(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
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
    public ResponseEntity<User> login(@Valid @RequestBody LoginUserInput input) {
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
    public User changePassword(@PathVariable String userId,
                               @Valid @RequestBody UpdatePasswordInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPassword(userService.encodeUserPassword(input.getPassword()));
        return userRepository.save(user);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/users")
    public User createUser(@Valid @RequestBody CreateUserInput input) {
        User user = new User();
        user.setUpdateAttributes(input);
        user.setLogin(input.getEmail());
        user.setOrganization(updateRelationResolver(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        return userRepository.save(user);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/users/{userId}")
    public User updateUser(@PathVariable String userId, @Valid @RequestBody UpdateUserInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setUpdateAttributes(input);
        user.setOrganization(updateRelationResolver(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        return userRepository.save(user);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/users/{userId}")
    public void deleteUser(@PathVariable String userId) {
        userRepository.deleteById(userId);
    }
}
