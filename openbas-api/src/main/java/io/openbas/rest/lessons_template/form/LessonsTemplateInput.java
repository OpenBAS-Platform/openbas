package io.openbas.rest.lessons_template.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class LessonsTemplateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("lessons_template_name")
  private String name;

  @JsonProperty("lessons_template_description")
  private String description;

}
