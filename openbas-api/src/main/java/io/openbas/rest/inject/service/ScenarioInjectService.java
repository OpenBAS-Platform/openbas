package io.openbas.rest.inject.service;

import io.openbas.database.model.Scenario;
import io.openbas.service.ScenarioService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class ScenarioInjectService {

  private final ScenarioService scenarioService;
  private final InjectService injectService;

  public void deleteInject(@NotBlank final String scenarioId, @NotBlank final String injectId) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    assert scenarioId.equals(scenario.getId());
    this.injectService.delete(injectId);
    this.scenarioService.updateScenario(scenario);
  }
}
