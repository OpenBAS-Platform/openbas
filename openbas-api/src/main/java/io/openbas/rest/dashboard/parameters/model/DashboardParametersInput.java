package io.openbas.rest.dashboard.parameters.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DashboardParametersInput {

  @JsonProperty("parameters_id")
  @NotBlank
  private String id;

  @JsonProperty("parameters_value")
  private String value;
}
