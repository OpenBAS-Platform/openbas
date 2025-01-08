package io.openbas.rest.scenario.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;

@Data
public class CheckScenarioRulesInput {
  @JsonProperty("new_tags")
  List<String> newTags;
}
