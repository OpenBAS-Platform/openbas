package io.openbas.database.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayloadArgument {

  @NotBlank
  private String key;

  private String description;

  @NotBlank
  private String value;

  @NotBlank
  private String type;

}
