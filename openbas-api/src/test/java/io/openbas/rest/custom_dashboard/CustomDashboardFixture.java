package io.openbas.rest.custom_dashboard;

import io.openbas.database.model.CustomDashboard;

public class CustomDashboardFixture {

  public static final String NAME = "Custom Dashboard";

  public static CustomDashboard createDefaultCustomDashboard() {
    CustomDashboard customDashboard = new CustomDashboard();
    customDashboard.setName(NAME);
    customDashboard.setContent("{\"chart\": \"bar\"}");
    return customDashboard;
  }
}
