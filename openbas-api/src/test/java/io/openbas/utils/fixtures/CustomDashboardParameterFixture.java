package io.openbas.utils.fixtures;

import io.openbas.database.model.CustomDashboardParameters;

public class CustomDashboardParameterFixture {

  public static CustomDashboardParameters createSimulationCustomDashboardParameter() {
    CustomDashboardParameters customDashboardParameters = new CustomDashboardParameters();
    customDashboardParameters.setName("simulation_param");
    customDashboardParameters.setType(
        CustomDashboardParameters.CustomDashboardParameterType.simulation);
    return customDashboardParameters;
  }
}
