package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PayloadPrerequisite {

  @NotBlank
  @JsonProperty("executor")
  private String executor;

  @NotBlank
  @JsonProperty("get_command")
  private String getCommand;

  @JsonProperty("check_command")
  private String checkCommand;

  @JsonProperty("description")
  private String description;
}
