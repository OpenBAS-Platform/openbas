package io.openbas.rest.scenario.response;

import io.openbas.database.model.Scenario;
import io.openbas.rest.challenge.PublicEntity;

public class PublicScenario extends PublicEntity {

  public PublicScenario(Scenario scenario) {
    setId(scenario.getId());
    setName(scenario.getName());
    setDescription(scenario.getDescription());
  }
}
