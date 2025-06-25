package io.openbas.rest.custom_dashboard.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CustomDashboardParameterValueInput {

  @JsonProperty("custom_dashboards_parameter_value")
  private String value;
}
