package io.openbas.utils.fixtures;

import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import java.util.List;

public class TeamFixture {

  public static final String TEAM_NAME = "My team";

  public static Team getTeam(final User user) {
    return getTeam(List.of(user), TEAM_NAME, false); // Call the other method with default value
  }

  public static Team getTeam(final List<User> users, String name, Boolean isContextualTeam) {
    Team team = new Team();
    team.setName(name);
    team.setContextual(isContextualTeam);
    if (users != null) {
      team.setUsers(users);
    }
    return team;
  }
}
