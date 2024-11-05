package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.raw.TargetType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class TargetSimple {

  @Schema(description = "Id")
  @JsonProperty("target_id")
  @NotNull
  private String id;

  @Schema(description = "Name")
  @JsonProperty("target_name")
  private String name;

  @Schema(description = "Type")
  @JsonProperty("target_type")
  private TargetType type;
}
