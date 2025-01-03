package io.openbas.rest.user;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.database.specification.TokenSpecification.fromUser;
import static io.openbas.helper.DatabaseHelper.updateRelation;

import io.openbas.config.SessionManager;
import io.openbas.database.model.Token;
import io.openbas.database.model.User;
import io.openbas.database.repository.OrganizationRepository;
import io.openbas.database.repository.TokenRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.exception.InputValidationException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.user.form.me.UpdateMePasswordInput;
import io.openbas.rest.user.form.me.UpdateProfileInput;
import io.openbas.rest.user.form.user.RenewTokenInput;
import io.openbas.rest.user.form.user.UpdateUserInfoInput;
import io.openbas.service.UserService;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
public class MeApi extends RestBehavior {

  @Resource private SessionManager sessionManager;

  private OrganizationRepository organizationRepository;
  private TokenRepository tokenRepository;
  private UserRepository userRepository;
  private UserService userService;

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
  public void setTokenRepository(TokenRepository tokenRepository) {
    this.tokenRepository = tokenRepository;
  }

  @Secured(ROLE_USER)
  @GetMapping("/api/logout")
  public ResponseEntity<Object> logout() {
    return ResponseEntity.ok().build();
  }

  @Secured(ROLE_USER)
  @GetMapping("/api/me")
  public User me() {
    return userRepository
        .findById(currentUser().getId())
        .orElseThrow(() -> new ElementNotFoundException("Current user not found"));
  }

  @Secured(ROLE_USER)
  @PutMapping("/api/me/profile")
  public User updateProfile(@Valid @RequestBody UpdateProfileInput input) {
    User user =
        userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new ElementNotFoundException("Current user not found"));
    user.setUpdateAttributes(input);
    user.setOrganization(
        updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
    User savedUser = userRepository.save(user);
    sessionManager.refreshUserSessions(savedUser);
    return savedUser;
  }

  @Secured(ROLE_USER)
  @PutMapping("/api/me/information")
  public User updateInformation(@Valid @RequestBody UpdateUserInfoInput input) {
    User user =
        userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new ElementNotFoundException("Current user not found"));
    user.setUpdateAttributes(input);
    User savedUser = userRepository.save(user);
    sessionManager.refreshUserSessions(savedUser);
    return savedUser;
  }

  @Secured(ROLE_USER)
  @PutMapping("/api/me/password")
  public User updatePassword(@Valid @RequestBody UpdateMePasswordInput input)
      throws InputValidationException {
    User user =
        userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new ElementNotFoundException("Current user not found"));
    if (userService.isUserPasswordValid(user, input.getCurrentPassword())) {
      user.setPassword(userService.encodeUserPassword(input.getPassword()));
      return userRepository.save(user);
    } else {
      throw new InputValidationException("user_current_password", "Bad current password");
    }
  }

  @Secured(ROLE_USER)
  @PostMapping("/api/me/token/refresh")
  @Transactional(rollbackOn = Exception.class)
  public Token renewToken(@Valid @RequestBody RenewTokenInput input)
      throws InputValidationException {
    User user =
        userRepository
            .findById(currentUser().getId())
            .orElseThrow(() -> new ElementNotFoundException("Current user not found"));
    Token token =
        tokenRepository.findById(input.getTokenId()).orElseThrow(ElementNotFoundException::new);
    if (!user.equals(token.getUser())) {
      throw new AccessDeniedException("You are not allowed to renew this token");
    }
    token.setValue(UUID.randomUUID().toString());
    return tokenRepository.save(token);
  }

  @Secured(ROLE_USER)
  @GetMapping("/api/me/tokens")
  public List<Token> tokens() {
    return tokenRepository.findAll(fromUser(currentUser().getId()));
  }
}
