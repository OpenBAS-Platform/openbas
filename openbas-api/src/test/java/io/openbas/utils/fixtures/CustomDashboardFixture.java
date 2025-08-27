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
        .addParameter("Time range", timeRange)
        .addParameter("Start date", startDate)
        .addParameter("End date", endDate);
  }
}
