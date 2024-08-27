package io.openbas.rest.scenario;

import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.scenario.response.PublicScenario;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class ScenarioPlayerApi extends RestBehavior {

  public static final String SCENARIO_URI = "/api/player/scenarios";

  private final UserRepository userRepository;
  private final ScenarioRepository scenarioRepository;

  @GetMapping(SCENARIO_URI + "/{scenarioId}")
  public PublicScenario playerScenario(@PathVariable String scenarioId, @RequestParam Optional<String> userId) {
    impersonateUser(this.userRepository, userId);
    Scenario scenario = this.scenarioRepository.findById(scenarioId).orElseThrow(ElementNotFoundException::new);
    return new PublicScenario(scenario);
  }

}
