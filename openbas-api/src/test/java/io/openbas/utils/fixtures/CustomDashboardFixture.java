package io.openbas.utils.fixtures;

import io.openbas.database.model.CustomDashboard;

public class CustomDashboardFixture {

  public static final String NAME = "Custom Dashboard";

  public static CustomDashboard createDefaultCustomDashboard() {
    CustomDashboard customDashboard = new CustomDashboard();
    customDashboard.setName(NAME);
    return customDashboard;
  }
}
