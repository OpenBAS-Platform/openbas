package io.openex.rest.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class ScenarioCreateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("scenario_name")
  private String name;

  @JsonProperty("scenario_description")
  private String description;

  @JsonProperty("scenario_subtitle")
  private String subtitle;

  @JsonProperty("scenario_tags")
  private List<String> tagIds = new ArrayList<>();

}
