package io.openex.rest.user;

import io.openex.config.SessionManager;
import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.OrganizationRepository;
import io.openex.database.repository.TokenRepository;
import io.openex.database.repository.UserRepository;
import io.openex.rest.exception.InputValidationException;
import io.openex.rest.helper.RestBehavior;
import io.openex.rest.user.form.me.UpdateMePasswordInput;
import io.openex.rest.user.form.me.UpdateProfileInput;
import io.openex.rest.user.form.user.RenewTokenInput;
import io.openex.rest.user.form.user.UpdateUserInfoInput;
import io.openex.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.annotation.security.RolesAllowed;
import javax.transaction.Transactional;
import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

import static io.openex.config.SessionHelper.currentUser;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.database.specification.TokenSpecification.fromUser;
import static io.openex.helper.DatabaseHelper.updateRelation;

@RestController
public class MeApi extends RestBehavior {

  @Resource
  private SessionManager sessionManager;

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

  @RolesAllowed(ROLE_USER)
  @GetMapping("/api/logout")
  public ResponseEntity<Object> logout() {
    return ResponseEntity.ok().build();
  }

  @RolesAllowed(ROLE_USER)
  @GetMapping("/api/me")
  public User me() {
    return userRepository.findById(currentUser().getId()).orElseThrow();
  }

  @RolesAllowed(ROLE_USER)
  @PutMapping("/api/me/profile")
  public User updateProfile(@Valid @RequestBody UpdateProfileInput input) {
    User user = userRepository.findById(currentUser().getId()).orElseThrow();
    user.setUpdateAttributes(input);
    user.setOrganization(updateRelation(input.getOrganizationId(), user.getOrganization(), organizationRepository));
    User savedUser = userRepository.save(user);
    sessionManager.refreshUserSessions(savedUser);
    return savedUser;
  }

  @RolesAllowed(ROLE_USER)
  @PutMapping("/api/me/information")
  public User updateInformation(@Valid @RequestBody UpdateUserInfoInput input) {
    User user = userRepository.findById(currentUser().getId()).orElseThrow();
    user.setUpdateAttributes(input);
    User savedUser = userRepository.save(user);
    sessionManager.refreshUserSessions(savedUser);
    return savedUser;
  }

  @RolesAllowed(ROLE_USER)
  @PutMapping("/api/me/password")
  public User updatePassword(@Valid @RequestBody UpdateMePasswordInput input) throws InputValidationException {
    User user = userRepository.findById(currentUser().getId()).orElseThrow();
    if (userService.isUserPasswordValid(user, input.getCurrentPassword())) {
      user.setPassword(userService.encodeUserPassword(input.getPassword()));
      return userRepository.save(user);
    } else {
      throw new InputValidationException("user_current_password", "Bad current password");
    }
  }

  @RolesAllowed(ROLE_USER)
  @PostMapping("/api/me/token/refresh")
  @Transactional(rollbackOn = Exception.class)
  public Token renewToken(@Valid @RequestBody RenewTokenInput input) throws InputValidationException {
    User user = userRepository.findById(currentUser().getId()).orElseThrow();
    Token token = tokenRepository.findById(input.getTokenId()).orElseThrow();
    if (!user.equals(token.getUser())) {
      throw new AccessDeniedException("You are not allowed to renew this token");
    }
    token.setValue(UUID.randomUUID().toString());
    return tokenRepository.save(token);
  }

  @RolesAllowed(ROLE_USER)
  @GetMapping("/api/me/tokens")
  public List<Token> tokens() {
    return tokenRepository.findAll(fromUser(currentUser().getId()));
  }
}
