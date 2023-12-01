package io.openex.rest.user;

import io.openex.config.SessionManager;
import io.openex.database.model.User;
import io.openex.database.repository.OrganizationRepository;
import io.openex.database.repository.TagRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.exception.InputValidationException;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.login.LoginUserInput;
import io.openex.rest.user.form.login.ResetUserInput;
import io.openex.rest.user.form.user.ChangePasswordInput;
import io.openex.rest.user.form.user.CreateUserInput;
import io.openex.rest.user.form.user.UpdateUserInput;
import io.openex.service.MailingService;
import io.openex.service.UserService;
import org.apache.commons.collections4.map.PassiveExpiringMap;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Autowired;
import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.helper.DatabaseHelper.updateRelation;
import static io.openex.helper.StreamHelper.fromIterable;

@RestController
public class UserApi extends RestBehavior {
    PassiveExpiringMap<String, String> resetTokenMap = new PassiveExpiringMap<>(1000 * 60 * 10);
    @Autowired
    private SessionManager sessionManager;
    private OrganizationRepository organizationRepository;
    private UserRepository userRepository;
    private TagRepository tagRepository;
    private UserService userService;
    private MailingService mailingService;

    @Autowired
    public void setMailingService(MailingService mailingService) {
        this.mailingService = mailingService;
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
    public User login(@Valid @RequestBody LoginUserInput input) {
        Optional<User> optionalUser = userRepository.findByEmail(input.getLogin());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (userService.isUserPasswordValid(user, input.getPassword())) {
                userService.createUserSession(user);
                return user;
            }
        }
        throw new AccessDeniedException("Invalid credentials");
    }

    @PostMapping("/api/reset")
    public void passwordReset(@Valid @RequestBody ResetUserInput input) {
        Optional<User> optionalUser = userRepository.findByEmail(input.getLogin());
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String resetToken = RandomStringUtils.randomNumeric(8);
            String username = user.getName() != null ? user.getName() : user.getEmail();
            if ("fr".equals(input.getLang())) {
                String subject = resetToken + " est votre code de récupération de compte OpenEx";
                String body = "Bonjour " + username + ",</br>" +
                        "Nous avons reçu une demande de réinitialisation de votre mot de passe OpenEx.</br>" +
                        "Entrez le code de réinitialisation du mot de passe suivant : " + resetToken;
                mailingService.sendEmail(subject, body, List.of(user));
            } else {
                String subject = resetToken + " is your recovery code of your OpenEx account";
                String body = "Hi " + username + ",</br>" +
                        "A request has been made to reset your OpenEx password.</br>" +
                        "Enter the following password recovery code: " + resetToken;
                mailingService.sendEmail(subject, body, List.of(user));
            }
            // Store in memory reset token
            resetTokenMap.put(resetToken, user.getId());
        }
    }

    @PostMapping("/api/reset/{token}")
    public User changePasswordReset(@PathVariable String token, @Valid @RequestBody ChangePasswordInput input) throws InputValidationException {
        String userId = resetTokenMap.get(token);
        if (userId != null) {
            String password = input.getPassword();
            String passwordValidation = input.getPasswordValidation();
            if (!passwordValidation.equals(password)) {
                throw new InputValidationException("password_validation", "Bad password validation");
            }
            User changeUser = userRepository.findById(userId).orElseThrow();
            changeUser.setPassword(userService.encodeUserPassword(password));
            User savedUser = userRepository.save(changeUser);
            resetTokenMap.remove(token);
            return savedUser;
        }
        // Bad token or expired token
        throw new AccessDeniedException("Invalid credentials");
    }

    @GetMapping("/api/reset/{token}")
    public boolean validatePasswordResetToken(@PathVariable String token) {
        return resetTokenMap.get(token) != null;
    }

    @RolesAllowed(ROLE_ADMIN)
    @GetMapping("/api/users")
    public Iterable<User> users() {
        return userRepository.findAll();
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/users/{userId}/password")
    public User changePassword(@PathVariable String userId,
                               @Valid @RequestBody ChangePasswordInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setPassword(userService.encodeUserPassword(input.getPassword()));
        return userRepository.save(user);
    }

    @Transactional(rollbackOn = Exception.class)
    @RolesAllowed(ROLE_ADMIN)
    @PostMapping("/api/users")
    public User createUser(@Valid @RequestBody CreateUserInput input) {
        return userService.createUser(input, 1);
    }

    @RolesAllowed(ROLE_ADMIN)
    @PutMapping("/api/users/{userId}")
    public User updateUser(@PathVariable String userId, @Valid @RequestBody UpdateUserInput input) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setUpdateAttributes(input);
        user.setTags(fromIterable(tagRepository.findAllById(input.getTagIds())));
        user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
        User savedUser = userRepository.save(user);
        sessionManager.refreshUserSessions(savedUser);
        return savedUser;
    }

    @RolesAllowed(ROLE_ADMIN)
    @DeleteMapping("/api/users/{userId}")
    public void deleteUser(@PathVariable String userId) {
        sessionManager.invalidateUserSession(userId);
        userRepository.deleteById(userId);
    }
}
