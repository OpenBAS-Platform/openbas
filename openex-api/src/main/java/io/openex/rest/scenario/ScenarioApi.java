package io.openex.rest.scenario;

import io.openex.database.model.Scenario;
import io.openex.database.model.Team;
import io.openex.database.repository.TagRepository;
import io.openex.rest.exercise.form.ScenarioTeamPlayersEnableInput;
import io.openex.rest.scenario.form.*;
import io.openex.service.ImportService;
import io.openex.service.ScenarioService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static io.openex.database.model.User.ROLE_ADMIN;
import static io.openex.database.model.User.ROLE_USER;
import static io.openex.helper.StreamHelper.fromIterable;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class ScenarioApi {

  public static final String SCENARIO_URI = "/api/scenarios";

  private final ScenarioService scenarioService;
  private final TagRepository tagRepository;
  private final ImportService importService;

  @PostMapping(SCENARIO_URI)
  // TODO: Admin only ?
  public Scenario createScenario(@Valid @RequestBody final ScenarioInput input) {
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

  @PutMapping(SCENARIO_URI + "/{scenarioId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Scenario updateScenario(
      @PathVariable @NotBlank final String scenarioId,
      @Valid @RequestBody final ScenarioInput input) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    scenario.setUpdateAttributes(input);
    scenario.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));
    return this.scenarioService.updateScenario(scenario);
  }

  @PutMapping(SCENARIO_URI + "/{scenarioId}/information")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Scenario updateScenarioInformation(
      @PathVariable @NotBlank final String scenarioId,
      @Valid @RequestBody final ScenarioInformationInput input) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    scenario.setUpdateAttributes(input);
    return this.scenarioService.updateScenario(scenario);
  }

  @DeleteMapping(SCENARIO_URI + "/{scenarioId}")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public void deleteScenario(@PathVariable @NotBlank final String scenarioId) {
    this.scenarioService.deleteScenario(scenarioId);
  }

  // -- TEAMS --

  @PutMapping(SCENARIO_URI + "/{scenarioId}/tags")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Scenario updateScenarioTags(
      @PathVariable @NotBlank final String scenarioId,
      @Valid @RequestBody final ScenarioUpdateTagsInput input) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    scenario.setTags(fromIterable(this.tagRepository.findAllById(input.getTagIds())));
    return scenarioService.updateScenario(scenario);
  }

  // -- EXPORT --

  @GetMapping(SCENARIO_URI + "/{scenarioId}/export")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public void exportScenario(
      @PathVariable @NotBlank final String scenarioId,
      @RequestParam(required = false) final boolean isWithPlayers,
      @RequestParam(required = false) final boolean isWithVariableValues,
      HttpServletResponse response)
      throws IOException {
    this.scenarioService.exportScenario(scenarioId, isWithPlayers, isWithVariableValues, response);
  }

  // -- IMPORT --

  @GetMapping(SCENARIO_URI + "/import")
  @Secured(ROLE_ADMIN)
  public void importScenario(@RequestPart("file") @NotNull MultipartFile file) throws Exception {
    this.importService.handleFileImport(file);
  }

  // -- TEAMS --

  @Transactional(rollbackOn = Exception.class)
  @PutMapping(SCENARIO_URI + "/{scenarioId}/teams/add")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Iterable<Team> addScenarioTeams(
      @PathVariable @NotBlank final String scenarioId,
      @Valid @RequestBody final ScenarioUpdateTeamsInput input) {
    return this.scenarioService.addTeams(scenarioId, input.getTeamIds());
  }

  @GetMapping(SCENARIO_URI + "/{scenarioId}/teams")
  @PreAuthorize("isScenarioObserver(#scenarioId)")
  public Iterable<Team> scenarioTeams(@PathVariable @NotBlank final String scenarioId) {
    Scenario scenario = this.scenarioService.scenario(scenarioId);
    return scenario.getTeams();
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping(SCENARIO_URI + "/{scenarioId}/teams/remove")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Iterable<Team> removeScenarioTeams(
      @PathVariable @NotBlank final String scenarioId,
      @Valid @RequestBody final ScenarioUpdateTeamsInput input) {
    return this.scenarioService.removeTeams(scenarioId, input.getTeamIds());
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping(SCENARIO_URI + "/{scenarioId}/teams/{teamId}/players/add")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Scenario addScenarioTeamPlayer(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String teamId,
      @Valid @RequestBody final ScenarioTeamPlayersEnableInput input) {
    return this.scenarioService.addPlayer(scenarioId, teamId, input.getPlayersIds());
  }

  @Transactional(rollbackOn = Exception.class)
  @PutMapping(SCENARIO_URI + "/{scenarioId}/teams/{teamId}/players/remove")
  @PreAuthorize("isScenarioPlanner(#scenarioId)")
  public Scenario removeExerciseTeamPlayers(
      @PathVariable @NotBlank final String scenarioId,
      @PathVariable @NotBlank final String teamId,
      @Valid @RequestBody final ScenarioTeamPlayersEnableInput input) {
    return this.scenarioService.removePlayer(scenarioId, teamId, input.getPlayersIds());
  }

}
