package io.openbas.utils.fixtures;

import io.openbas.database.model.Scenario;

public class ScenarioFixture {

  public static Scenario getScenario() {
    Scenario scenario = new Scenario();
    scenario.setName("Crisis simulation");
    scenario.setDescription("A crisis simulation for my enterprise");
    scenario.setSubtitle("A crisis simulation");
    return scenario;
  }

}
