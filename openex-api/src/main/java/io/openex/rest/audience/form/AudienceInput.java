package io.openex.rest.audience.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Getter
@Setter
public class AudienceInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("audience_name")
  private String name;

  @JsonProperty("audience_description")
  private String description;

  @JsonProperty("audience_tags")
  private List<String> tagIds = new ArrayList<>();

}
