package io.openbas.database.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayloadPrerequisite {

  @NotBlank
  private String executor;

  private String description;

  private String checkCommand;

  @NotBlank
  private String getCommand;

}
