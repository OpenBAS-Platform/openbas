package io.openbas.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class ScenarioUpdateTagsInput {

  @JsonProperty("scenario_tags")
  private List<String> tagIds = new ArrayList<>();

}
