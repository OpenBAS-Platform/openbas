package io.openbas.runner;

import static io.openbas.database.model.Token.ADMIN_TOKEN_UUID;
import static io.openbas.database.model.User.ADMIN_UUID;
import static org.assertj.core.api.Assertions.assertThat;

import io.openbas.database.model.Token;
import io.openbas.database.model.User;
import io.openbas.database.repository.TokenRepository;
import io.openbas.database.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class InitAdminCommandLineRunnerTest {

  @Autowired private UserRepository userRepository;

  @Autowired private TokenRepository tokenRepository;

  @DisplayName("Test if admin user is created")
  @Test
  void adminUserExistTest() {
    Optional<User> adminUser = this.userRepository.findById(ADMIN_UUID);
    assertThat(adminUser.isPresent()).isTrue();
  }

  @DisplayName("Test if admin token is created")
  @Test
  void adminTokenExistTest() {
    Optional<Token> adminToken = this.tokenRepository.findById(ADMIN_TOKEN_UUID);
    assertThat(adminToken.isPresent()).isTrue();
  }
}
