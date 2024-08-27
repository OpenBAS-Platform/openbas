package io.openbas.utils.fixtures;

import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Team;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ScenarioFixture {

  public static Scenario getScenario() {
    return getScenario(null, null);
  }

  public static Scenario getScenario(List<Team> scenarioTeams, Set<Inject> scenarioInjects) {
    Scenario scenario = new Scenario();
    scenario.setName("Crisis simulation");
    scenario.setDescription("A crisis simulation for my enterprise");
    scenario.setSubtitle("A crisis simulation");
    scenario.setFrom("simulation@mail.fr");
    if(scenarioTeams != null){
      scenario.setTeams(scenarioTeams);
    }
    if(scenarioInjects != null){
      scenario.setInjects(scenarioInjects);
    }
    return scenario;
  }

}
