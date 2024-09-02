package io.openbas.utils.fixtures;

import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Team;

import java.util.List;
import java.util.Set;

import static io.openbas.database.model.Scenario.SEVERITY.critical;

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

  public static Scenario createDefaultCrisisScenario() {
    Scenario scenario = new Scenario();
    scenario.setName("Crisis scenario");
    scenario.setDescription("A crisis scenario for my enterprise");
    scenario.setSubtitle("A crisis scenario");
    scenario.setFrom("scenario@mail.fr");
    scenario.setCategory("crisis-communication");
    return scenario;
  }

  public static Scenario createDefaultIncidentResponseScenario() {
    Scenario scenario = new Scenario();
    scenario.setName("Incident response scenario");
    scenario.setDescription("An incident response scenario for my enterprise");
    scenario.setSubtitle("An incident response scenario");
    scenario.setFrom("scenario@mail.fr");
    scenario.setCategory("incident-response");
    scenario.setSeverity(critical);
    return scenario;
  }

}
