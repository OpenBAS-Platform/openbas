package io.openbas.utils.fixtures;

import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.rest.team.form.TeamCreateInput;
import java.util.ArrayList;
import java.util.List;

public class TeamFixture {

  public static final String TEAM_NAME = "My team";
  public static final String CONTEXTUAL_TEAM_NAME = "My contextual team";

  public static TeamCreateInput createTeam() {
    TeamCreateInput teamCreateInput = new TeamCreateInput();
    teamCreateInput.setName(TEAM_NAME);
    teamCreateInput.setDescription("Team description");
    return teamCreateInput;
  }

  public static TeamCreateInput createContextualExerciseTeam(List<String> exerciseIds) {
    TeamCreateInput teamCreateInput = new TeamCreateInput();
    teamCreateInput.setName(CONTEXTUAL_TEAM_NAME);
    teamCreateInput.setDescription("Team description");
    teamCreateInput.setContextual(true);
    teamCreateInput.setExerciseIds(exerciseIds);
    return teamCreateInput;
  }

  public static TeamCreateInput createContextualScenarioTeam(List<String> scenarioIds) {
    TeamCreateInput teamCreateInput = new TeamCreateInput();
    teamCreateInput.setName("Scenario team");
    teamCreateInput.setDescription("Team description");
    teamCreateInput.setContextual(true);
    teamCreateInput.setScenarioIds(scenarioIds);
    return teamCreateInput;
  }

  public static Team getTeam(final User user) {
    return getTeam(user, TEAM_NAME, false); // Call the other method with default value
  }

  public static Team getTeam(final User user, String name, Boolean isContextualTeam) {
    Team team = new Team();
    team.setName(name);
    team.setContextual(isContextualTeam);
    if (user != null) {
      team.setUsers(
          new ArrayList<>() {
            {
              add(user);
            }
          });
    }
    return team;
  }
}
