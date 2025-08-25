package io.openbas.rest.inject.service;

import io.openbas.database.model.Scenario;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.service.ScenarioService;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Slf4j
public class ScenarioInjectService {

  private final ScenarioService scenarioService;
  private final InjectDocumentRepository injectDocumentRepository;
  private final InjectRepository injectRepository;

  public void deleteInject(@NotBlank final String scenarioId, @NotBlank final String injectId) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    assert scenarioId.equals(scenario.getId());
    this.injectDocumentRepository.deleteDocumentsFromInject(injectId);
    this.injectRepository.deleteById(injectId);
    scenario.setUpdatedAt(Instant.now());
    this.scenarioService.updateScenario(scenario);
  }
}
