package io.openex.rest.variable.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class VariableInput {

  @JsonProperty("variable_key")
  @NotBlank(message = MANDATORY_MESSAGE)
  @Pattern(regexp="^[a-z_]+$")
  private String key;

  @JsonProperty("variable_value")
  private String value;

  @JsonProperty("variable_description")
  private String description;

}
