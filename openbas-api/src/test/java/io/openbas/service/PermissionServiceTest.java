package io.openbas.service;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;

import io.openbas.database.model.Action;
import io.openbas.database.model.Capability;
import io.openbas.database.model.Group;
import io.openbas.database.model.ResourceType;
import io.openbas.database.model.Role;
import io.openbas.database.model.User;
import io.openbas.utils.fixtures.UserFixture;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class PermissionServiceTest {
  private static final String RESOURCE_ID = "resourceid";
  private static final String USER_ID = "userid";

  @Mock private GrantService grantService;

  @InjectMocks private PermissionService permissionService;

  @Test
  public void test_hasPermission_WHEN_admin() {
    assertTrue(
        permissionService.hasPermission(
            getUser(USER_ID, true), RESOURCE_ID, ResourceType.SCENARIO, Action.WRITE));
  }

  @Test
  public void test_hasPermission_read_WHEN_has_read_grant() {
    User user = getUser(USER_ID, false);
    when(grantService.hasReadGrant(RESOURCE_ID, user)).thenReturn(true);
    assertTrue(
        permissionService.hasPermission(user, RESOURCE_ID, ResourceType.SCENARIO, Action.READ));
  }

  @Test
  public void test_hasPermission_write_WHEN_has_write_grant() {
    User user = getUser(USER_ID, false);
    when(grantService.hasWriteGrant(RESOURCE_ID, user)).thenReturn(true);
    assertTrue(
        permissionService.hasPermission(user, RESOURCE_ID, ResourceType.SIMULATION, Action.WRITE));
  }

  @Test
  public void test_hasPermission_launch_WHEN_has_launch_grant() {
    User user = getUser(USER_ID, false);
    when(grantService.hasLaunchGrant(RESOURCE_ID, user)).thenReturn(true);
    assertTrue(
        permissionService.hasPermission(user, RESOURCE_ID, ResourceType.SCENARIO, Action.LAUNCH));
  }

  @Test
  public void test_hasPermission_search_WHEN_has_no_grant() {
    User user = getUser(USER_ID, false);
    assertTrue(
        permissionService.hasPermission(user, RESOURCE_ID, ResourceType.SCENARIO, Action.SEARCH));
  }

  @Test
  public void test_hasPermission_read_WHEN_has_read_capa() {
    User user = getUser(USER_ID, false);
    user.setGroups(List.of(getGroup(Capability.ACCESS_CHANNELS)));
    assertTrue(
        permissionService.hasPermission(user, RESOURCE_ID, ResourceType.CHANNEL, Action.READ));
  }

  @Test
  public void test_hasPermission_read_WHEN_has_bypass_capa() {
    User user = getUser(USER_ID, false);
    user.setGroups(List.of(getGroup(Capability.BYPASS)));
    assertTrue(
        permissionService.hasPermission(user, RESOURCE_ID, ResourceType.CHANNEL, Action.READ));
  }

  @Test
  public void test_hasPermission_write_WHEN_has_read_capa() {
    User user = getUser(USER_ID, false);
    user.setGroups(List.of(getGroup(Capability.ACCESS_CHANNELS)));
    assertFalse(
        permissionService.hasPermission(user, RESOURCE_ID, ResourceType.CHANNEL, Action.WRITE));
  }

  private User getUser(final String id, final boolean isAdmin) {
    User user = UserFixture.getUser();
    user.setAdmin(isAdmin);
    user.setId(id);
    return user;
  }

  private Group getGroup(final Capability capability) {
    Set<Capability> capabilities = new HashSet<>();
    capabilities.add(capability);
    Role role = new Role();
    role.setId("testid");
    role.setCapabilities(capabilities);
    List<Role> roles = new ArrayList<>();
    roles.add(role);
    Group group = new Group();
    group.setId("testid");
    group.setRoles(roles);
    return group;
  }
}
