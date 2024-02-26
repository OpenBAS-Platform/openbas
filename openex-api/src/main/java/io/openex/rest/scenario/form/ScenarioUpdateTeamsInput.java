package io.openex.rest.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ScenarioUpdateTeamsInput {

  @JsonProperty("scenario_teams")
  private List<String> teamIds = new ArrayList<>();

}
