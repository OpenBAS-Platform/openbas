package io.openbas.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

@Data
public class ScenarioInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("scenario_name")
  private String name;

  @JsonProperty("scenario_description")
  private String description;

  @JsonProperty("scenario_subtitle")
  private String subtitle;

  @JsonProperty("scenario_category")
  private String category;

  @JsonProperty("scenario_main_focus")
  private String mainFocus;

  @JsonProperty("scenario_severity")
  private String severity;

  @JsonProperty("scenario_tags")
  private List<String> tagIds = new ArrayList<>();

}
