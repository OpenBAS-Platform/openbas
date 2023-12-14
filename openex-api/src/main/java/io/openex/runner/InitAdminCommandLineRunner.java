package io.openex.runner;

import io.openex.database.model.Token;
import io.openex.database.model.User;
import io.openex.database.repository.TokenRepository;
import io.openex.database.repository.UserRepository;
import org.apache.commons.validator.routines.EmailValidator;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static io.openex.database.model.Token.ADMIN_TOKEN_UUID;
import static io.openex.database.model.User.*;
import static org.apache.logging.log4j.util.Strings.isBlank;
import static org.apache.logging.log4j.util.Strings.isNotBlank;

@Component
public class InitAdminCommandLineRunner implements CommandLineRunner {

  @Value("${openex.admin.email:#{null}}")
  private String adminEmail;

  @Value("${openex.admin.password:#{null}}")
  private String adminPassword;

  @Value("${openex.admin.token:#{null}}")
  private String adminToken;

  private final UserRepository userRepository;

  private final TokenRepository tokenRepository;

  public InitAdminCommandLineRunner(
      @NotNull final UserRepository userRepository,
      @NotNull final TokenRepository tokenRepository) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
  }

  @Override
  @Transactional
  public void run(String... args) {
    // Handle admin user
    Optional<User> adminUserOptional = this.userRepository.findById(ADMIN_UUID);
    User adminUser = adminUserOptional.map(this::updateUser).orElseGet(this::createUser);

    // Handle admin token
    Optional<Token> adminToken = this.tokenRepository.findById(ADMIN_TOKEN_UUID);
    adminToken.ifPresentOrElse(this::updateToken, () -> this.createToken(adminUser));
  }

  // -- USER --

  private String encodedPassword() {
    Argon2PasswordEncoder passwordEncoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    return passwordEncoder.encode(this.adminPassword);
  }

  private User createUser() {
    if (isBlank(this.adminEmail)) {
      throw new IllegalArgumentException("Config properties 'openex.admin.email' cannot be null");
    } else if (!EmailValidator.getInstance().isValid(this.adminEmail)) {
      throw new IllegalArgumentException("Config properties 'openex.admin.email' should be a valid email address");
    }
    if (isBlank(this.adminPassword)) {
      throw new IllegalArgumentException("Config properties 'openex.admin.password' cannot be null");
    }

    this.userRepository.createAdmin(ADMIN_UUID, ADMIN_FIRSTNAME, ADMIN_LASTNAME, this.adminEmail, encodedPassword());
    return this.userRepository.findById(ADMIN_UUID).orElseThrow();
  }

  private User updateUser(@NotNull final User user) {
    if (isNotBlank(this.adminEmail)) {
      if (!EmailValidator.getInstance().isValid(this.adminEmail)) {
        throw new IllegalArgumentException("Config properties 'openex.admin.email' should be a valid email address");
      }
      user.setEmail(this.adminEmail);
    }
    if (isNotBlank(this.adminPassword)) {
      user.setPassword(encodedPassword());
    }

    return this.userRepository.save(user);
  }

  // -- TOKEN --

  private void createToken(@NotNull final User user) {
    if (isBlank(this.adminToken)) {
      throw new IllegalArgumentException("Config properties 'openex.admin.token' cannot be null");
    }
    try {
      UUID.fromString(this.adminToken);
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException("Config properties 'openex.admin.token' should be a valid UUID");
    }

    this.tokenRepository.createToken(ADMIN_TOKEN_UUID, user, this.adminToken, Instant.now());
  }

  private void updateToken(@NotNull final Token token) {
    if (isNotBlank(this.adminToken)) {
      try {
        UUID.fromString(this.adminToken);
      } catch (IllegalArgumentException e) {
        throw new IllegalArgumentException("Config properties 'openex.admin.token' should be a valid UUID");
      }
      token.setValue(this.adminToken);
    }

    this.tokenRepository.save(token);
  }
}
