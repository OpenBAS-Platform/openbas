package io.openbas.utils.fixtures;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.CustomDashboardParameters;

import java.util.List;

public class CustomDashboardFixture {

  public static final String NAME = "Custom Dashboard";

  public static CustomDashboard createDefaultCustomDashboard() {
    CustomDashboard customDashboard = new CustomDashboard();
    customDashboard.setName(NAME);
    return customDashboard;
  }

  public static CustomDashboard createCustomDashboardWithParams() {
    CustomDashboard customDashboard = new CustomDashboard();
    customDashboard.setName(NAME);
    CustomDashboardParameters customDashboardTimeRangeParameter = new CustomDashboardParameters();
    customDashboardTimeRangeParameter.setName("Time range");
    customDashboardTimeRangeParameter.setType(CustomDashboardParameters.CustomDashboardParameterType.timeRange);
    customDashboardTimeRangeParameter.setCustomDashboard(customDashboard);
    CustomDashboardParameters customDashboardStartDateParameter = new CustomDashboardParameters();
    customDashboardStartDateParameter.setName("Start date");
    customDashboardStartDateParameter.setType(CustomDashboardParameters.CustomDashboardParameterType.startDate);
    customDashboardStartDateParameter.setCustomDashboard(customDashboard);
    CustomDashboardParameters customDashboardEndDateParameter = new CustomDashboardParameters();
    customDashboardEndDateParameter.setName("End date");
    customDashboardEndDateParameter.setType(CustomDashboardParameters.CustomDashboardParameterType.endDate);
    customDashboardEndDateParameter.setCustomDashboard(customDashboard);
    customDashboard.setParameters(
        List.of(customDashboardTimeRangeParameter, customDashboardStartDateParameter, customDashboardEndDateParameter));
    return customDashboard;
  }
}
