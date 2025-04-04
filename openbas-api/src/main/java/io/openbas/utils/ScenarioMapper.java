package io.openbas.utils;

import io.openbas.database.model.Scenario;
import io.openbas.rest.scenario.form.ScenarioSimple;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class ScenarioMapper {

  public ScenarioSimple toScenarioSimple(@NotNull final Scenario scenario) {
    ScenarioSimple simple = new ScenarioSimple();
    BeanUtils.copyProperties(scenario, simple);
    return simple;
  }
}
