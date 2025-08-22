package io.openbas.utils.fixtures;

import static io.openbas.database.model.CustomDashboardParameters.CustomDashboardParameterType.*;

import io.openbas.database.model.CustomDashboard;

public class CustomDashboardFixture {

  public static final String NAME = "Custom Dashboard";

  public static CustomDashboard createDefaultCustomDashboard() {
    CustomDashboard customDashboard = new CustomDashboard();
    customDashboard.setName(NAME);
    return customDashboard;
  }

  public static CustomDashboard createCustomDashboardWithDefaultParams() {
    CustomDashboard customDashboard = new CustomDashboard();
    customDashboard.setName(NAME);
    return customDashboard
        .addParameter("Time range", TIME_RANGE)
        .addParameter("Start date", START_DATE)
        .addParameter("End date", END_DATE);
  }
}
