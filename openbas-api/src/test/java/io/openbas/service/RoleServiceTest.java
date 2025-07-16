package io.openbas.service;

import io.openbas.IntegrationTest;
import io.openbas.database.repository.RoleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class RoleServiceTest extends IntegrationTest {

  @Mock RoleRepository roleRepository;

  @InjectMocks RoleService roleService;

  @AfterEach
  void teardown() {
    globalTeardown();
  }

  @Test
  void testFindById() {}
}
