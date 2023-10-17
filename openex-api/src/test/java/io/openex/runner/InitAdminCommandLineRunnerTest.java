package io.openex.runner;

import io.openex.database.model.User;
import io.openex.database.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static io.openex.migration.V1__Init.ADMIN_UUID;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class InitAdminCommandLineRunnerTest {

  @Autowired
  private UserRepository userRepository;

  @DisplayName("Test if admin user is created")
  @Test
  void test() {
    Optional<User> admin = this.userRepository.findById(ADMIN_UUID);
    assertThat(admin.isPresent()).isEqualTo(true);
  }

}
