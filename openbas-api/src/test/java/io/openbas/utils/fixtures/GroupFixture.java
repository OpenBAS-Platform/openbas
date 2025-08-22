package io.openbas.utils.fixtures;

import io.openbas.database.model.Grant;
import io.openbas.database.model.Group;
import io.openbas.database.model.Role;
import java.util.List;

public class GroupFixture {

  public static Group createGroup() {
    Group group = new Group();
    group.setName("Group");
    group.setDescription("Group Description");
    return group;
  }

  public static Group createGroup(List<Role> roles, List<Grant> grants) {
    Group group = createGroup();
    group.setRoles(roles);
    group.setGrants(grants);
    return group;
  }
}
