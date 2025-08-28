package io.openbas.utils.fixtures;

import io.openbas.database.model.*;

public class GrantFixture {

  public static Grant getGrantForSimulation(Exercise simulation) {
    return getGrantForSimulation(simulation, Grant.GRANT_TYPE.PLANNER);
  }

  public static Grant getGrantForSimulation(Exercise simulation, Grant.GRANT_TYPE grantType) {
    Grant grant = new Grant();
    grant.setName(grantType);
    grant.setExercise(simulation);
    return grant;
  }

  public static Grant getGrantForSimulation(Exercise simulation, Group group) {
    Grant grant = new Grant();
    grant.setName(Grant.GRANT_TYPE.PLANNER);
    grant.setExercise(simulation);
    grant.setGroup(group);
    return grant;
  }

  public static Grant getGrantForScenario(Scenario scenario) {
    return getGrantForScenario(scenario, Grant.GRANT_TYPE.PLANNER);
  }

  public static Grant getGrantForScenario(Scenario scenario, Group group) {
    Grant grant = new Grant();
    grant.setName(Grant.GRANT_TYPE.PLANNER);
    grant.setScenario(scenario);
    grant.setGroup(group);
    return grant;
  }

  public static Grant getGrantForScenario(Scenario scenario, Grant.GRANT_TYPE grantType) {
    Grant grant = new Grant();
    grant.setName(grantType);
    grant.setScenario(scenario);
    return grant;
  }
}
