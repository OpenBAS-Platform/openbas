package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public class KillChainPhaseDTO {

  @Schema(description = "Id")
  @JsonProperty("phase_id")
  @NotNull
  private String id;

  @Schema(description = "Name")
  @JsonProperty("phase_name")
  private String name;
}
