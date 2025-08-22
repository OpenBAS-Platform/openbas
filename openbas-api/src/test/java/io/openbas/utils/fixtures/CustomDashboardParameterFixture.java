package io.openbas.utils.fixtures;

import static io.openbas.database.model.CustomDashboardParameters.CustomDashboardParameterType.SCENARIO;
import static io.openbas.database.model.CustomDashboardParameters.CustomDashboardParameterType.SIMULATION;

import io.openbas.database.model.CustomDashboardParameters;

public class CustomDashboardParameterFixture {

  public static CustomDashboardParameters createSimulationCustomDashboardParameter() {
    CustomDashboardParameters customDashboardParameters = new CustomDashboardParameters();
    customDashboardParameters.setName("simulation_param");
    customDashboardParameters.setType(SIMULATION);
    return customDashboardParameters;
  }

  public static CustomDashboardParameters createScenarioCustomDashboardParameter() {
    CustomDashboardParameters customDashboardParameters = new CustomDashboardParameters();
    customDashboardParameters.setName("scenario_param");
    customDashboardParameters.setType(SCENARIO);
    return customDashboardParameters;
  }
}
