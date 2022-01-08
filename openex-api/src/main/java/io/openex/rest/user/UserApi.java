package io.openex.rest.user;

import io.openex.database.model.Group;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.GroupRepository;
import io.openex.database.repository.OrganizationRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.repository.UserRepository;
import io.openex.database.specification.GroupSpecification;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.login.LoginUserInput;
import io.openex.rest.user.form.user.CreateUserInput;
import io.openex.rest.user.form.user.UpdatePasswordInput;
import io.openex.rest.user.form.user.UpdateUserInput;
import io.openex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.DatabaseHelper.updateRelation;

@RestController
public class UserApi extends RestBehavior {

    private OrganizationRepository organizationRepository;
    private GroupRepository groupRepository;
    private UserRepository userRepository;
    private TagRepository tagRepository;
    private UserService userService;

    @Autowired
    public void setGroupRepository(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @Autowired
    public void setTagRepository(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

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
    @GetMapping("/api/users")
    public Iterable<User> users() {
        return userRepository.findAll();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/users/{userId}/password")
    public User changePassword(@PathVariable String userId,
                               @Valid @RequestBody UpdatePasswordInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPassword(userService.encodeUserPassword(input.getPassword()));
        return userRepository.save(user);
    }

    @Transactional
    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/users")
    public User createUser(@Valid @RequestBody CreateUserInput input) {
        User user = new User();
        user.setUpdateAttributes(input);
        user.setPassword(userService.encodeUserPassword(input.getPassword()));
        user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        // Find automatic groups to assign
        List<Group> assignableGroups = groupRepository.findAll(GroupSpecification.defaultUserAssignable());
        user.setGroups(assignableGroups);
        // Save the user
        User savedUser = userRepository.save(user);
        userService.createUserToken(savedUser);
        return savedUser;
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/users/{userId}")
    public User updateUser(@PathVariable String userId, @Valid @RequestBody UpdateUserInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setUpdateAttributes(input);
        user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        return userRepository.save(user);
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/users/{userId}")
    public void deleteUser(@PathVariable String userId) {
        userRepository.deleteById(userId);
    }
}
