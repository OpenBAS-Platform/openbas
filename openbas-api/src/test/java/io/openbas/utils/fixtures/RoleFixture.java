package io.openbas.utils.fixtures;

import io.openbas.database.model.Capability;
import io.openbas.database.model.Role;
import java.util.Set;

public class RoleFixture {
  public static final String ROLE_NAME = "rolename";
  public static final Set<Capability> CAPABILITIES =
      Set.of(Capability.ACCESS_ASSETS, Capability.ACCESS_CHALLENGES);

  public static Role getRole() {
    Role role = new Role();
    role.setName(ROLE_NAME);
    role.setCapabilities(CAPABILITIES);
    return role;
  }

  public static Role getRole(Set<Capability> capabilities) {
    Role role = new Role();
    role.setName(ROLE_NAME);
    role.setCapabilities(capabilities);
    return role;
  }
}
