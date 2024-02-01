package io.openex.rest.scenario;

import io.openex.database.model.Scenario;
import io.openex.database.repository.TagRepository;
import io.openex.rest.scenario.form.ScenarioCreateInput;
import io.openex.rest.scenario.form.ScenarioSimple;
import io.openex.service.ScenarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.StreamHelper.fromIterable;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class ScenarioApi {

  public static final String SCENARIO_URI = "/api/scenarios";

  private final ScenarioService scenarioService;
  private final TagRepository tagRepository;

  @PostMapping(SCENARIO_URI)
  public Scenario createScenario(@Valid @RequestBody final ScenarioCreateInput input) {
    Scenario scenario = new Scenario();
    scenario.setUpdateAttributes(input);
    scenario.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));
    return this.scenarioService.createScenario(scenario);
  }

  @GetMapping(SCENARIO_URI)
  public List<ScenarioSimple> scenarios() {
    return this.scenarioService.scenarios();
  }

  @GetMapping(SCENARIO_URI + "/{scenarioId}")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Scenario scenario(@PathVariable @NotBlank final String scenarioId) {
    return scenarioService.scenario(scenarioId);
  }

  @DeleteMapping(SCENARIO_URI + "/{scenarioId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public void deleteScenario(@PathVariable @NotBlank final String scenarioId) {
    this.scenarioService.deleteScenario(scenarioId);
  }

}
