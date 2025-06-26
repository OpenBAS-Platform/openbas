package io.openbas.rest.dashboard.parameters.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DashboardParameters {

  @JsonProperty("parameters_id")
  @NotBlank
  private String id;

  @JsonProperty("parameters_name")
  @NotBlank
  private String name;

  @JsonProperty("parameters_type")
  @NotBlank
  private String type;
}
