package io.openbas.utils.fixtures;

import io.openbas.database.model.Group;

public class GroupFixture {

  public static Group createGroup() {
    Group group = new Group();
    group.setName("Group");
    group.setDescription("Group Description");
    return group;
  }
}
