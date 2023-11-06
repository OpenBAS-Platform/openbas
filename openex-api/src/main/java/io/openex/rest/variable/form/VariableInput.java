package io.openex.rest.variable.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openex.database.model.Variable;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class VariableInput {

  @JsonProperty("variable_key")
  @NotBlank(message = MANDATORY_MESSAGE)
  private String key;

  @JsonProperty("variable_value")
  @NotBlank(message = MANDATORY_MESSAGE)
  private String value;

  @JsonProperty("variable_description")
  private String description;

  @JsonProperty("variable_type")
  @NotNull
  private Variable.VariableType type;

}
