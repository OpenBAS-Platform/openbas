package io.openbas.rest.tag.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class TagCreateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("tag_name")
  private String name;

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("tag_color")
  private String color;
}
