package io.openex;

import io.openex.database.model.User;
import io.openex.database.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AppTests {

    @Autowired
    private UserRepository userRepository;

    @Test
    void whenTechnical_thenIncidentTypeShouldBeFound() {
        Optional<User> technical = userRepository.findByEmail("admin@openex.io");
        assertThat(technical.isPresent()).isEqualTo(true);
    }
}
