package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class PayloadArgument {
  @NotBlank
  @JsonProperty("type")
  private String type;

  @NotBlank
  @JsonProperty("key")
  private String key;

  @NotBlank
  @JsonProperty("default_value")
  private String defaultValue;

  @JsonProperty("description")
  @Schema(nullable = true)
  private String description;
}
