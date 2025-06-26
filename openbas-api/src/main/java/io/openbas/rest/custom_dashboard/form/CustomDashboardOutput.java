package io.openbas.rest.custom_dashboard.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.CustomDashboard;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomDashboardOutput {

  @JsonProperty("custom_dashboard_id")
  private String id;

  @JsonProperty("custom_dashboard_name")
  private String name;

  public static CustomDashboardOutput toCustomDashboard(CustomDashboard customDashboard) {
    CustomDashboardOutput customDashboardOutput = new CustomDashboardOutput();
    customDashboardOutput.setId(customDashboard.getId());
    customDashboardOutput.setName(customDashboard.getName());
    return customDashboardOutput;
  }
}
