package io.openbas.rest.scenario.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.Scenario;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublicScenario {

  @JsonProperty("scenario_id")
  private String id;

  @JsonProperty("scenario_name")
  private String name;

  @JsonProperty("scenario_description")
  private String description;

  public PublicScenario(Scenario scenario) {
    this.id = scenario.getId();
    this.name = scenario.getName();
    this.description = scenario.getDescription();
  }

}
