package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import lombok.Data;

@Data
public class ScenarioStatistic {

  @JsonProperty("scenarios_global_count")
  private long scenariosGlobalCount;

  @JsonProperty("scenarios_attack_scenario_count")
  private Map<String, Long> scenariosCategoriesCount;
}
