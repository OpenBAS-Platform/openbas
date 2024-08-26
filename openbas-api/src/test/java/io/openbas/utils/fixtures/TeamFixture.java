package io.openbas.utils.fixtures;

import io.openbas.database.model.Team;
import io.openbas.database.model.User;

import java.util.ArrayList;

public class TeamFixture {

  public static final String TEAM_NAME = "My team";

  public static Team getTeam(final User user) {
    return getTeam(user, TEAM_NAME, false); // Call the other method with default value
  }

  public static Team getTeam(final User user, String name, Boolean isContextualTeam ) {
    Team team = new Team();
    team.setName(name);
    team.setContextual(isContextualTeam);
    if (user != null) {
      team.setUsers(new ArrayList<>(){{add(user);}});
    }
    return team;
  }

}
