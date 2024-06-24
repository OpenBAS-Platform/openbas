package io.openbas.rest.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class InjectsImportInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("sheet_name")
  private String name;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("import_mapper_id")
  private String importMapperId;
}
