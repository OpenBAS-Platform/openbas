package io.openbas.service;

import io.openbas.database.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class RoleServiceTest {

  @Mock RoleRepository roleRepository;

  @InjectMocks RoleService roleService;

  @Test
  void testFindById() {}
}
