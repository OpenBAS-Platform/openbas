package io.openbas.rest;

import static io.openbas.database.specification.TeamSpecification.fromScenario;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.ScenarioFixture.getScenario;
import static io.openbas.utils.fixtures.TeamFixture.TEAM_NAME;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.ScenarioTeamUser;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.ScenarioTeamUserRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exercise.form.ExerciseTeamPlayersEnableInput;
import io.openbas.rest.exercise.form.ScenarioTeamPlayersEnableInput;
import io.openbas.rest.scenario.form.ScenarioUpdateTeamsInput;
import io.openbas.utils.fixtures.UserFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(PER_CLASS)
@Transactional
class ScenarioTeamApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private ScenarioTeamUserRepository scenarioTeamUserRepository;
  @Autowired private TeamRepository teamRepository;
  @Autowired private UserRepository userRepository;

  @DisplayName("Given a valid scenario and team input, should add team to scenario successfully")
  @Test
  @WithMockAdminUser
  void given_validScenarioAndTeamInput_should_addTeamToScenarioSuccessfully() throws Exception {
    // -- PREPARE --
    Scenario scenario = getScenario();
    Scenario scenarioCreated = this.scenarioRepository.save(scenario);
    Team team = new Team();
    team.setName(TEAM_NAME);
    Team teamCreated = this.teamRepository.save(team);
    ScenarioUpdateTeamsInput input = new ScenarioUpdateTeamsInput();
    input.setTeamIds(List.of(teamCreated.getId()));

    // -- EXECUTE --
    this.mvc
        .perform(
            put(SCENARIO_URI + "/" + scenarioCreated.getId() + "/teams/add")
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    Optional<Scenario> scenarioSaved = this.scenarioRepository.findById(scenarioCreated.getId());
    assertTrue(scenarioSaved.isPresent());
    assertEquals(TEAM_NAME, scenarioSaved.get().getTeams().getFirst().getName());
  }

  @DisplayName("Given a valid scenario with teams, should retrieve teams successfully")
  @Test
  @WithMockAdminUser
  void given_validScenarioWithTeams_should_retrieveTeamsSuccessfully() throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName(TEAM_NAME);
    Team teamCreated = this.teamRepository.save(team);

    Scenario scenario = getScenario();
    scenario.setTeams(List.of(teamCreated));
    Scenario scenarioCreated = this.scenarioRepository.save(scenario);

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                get(SCENARIO_URI + "/" + scenarioCreated.getId() + "/teams")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(teamCreated.getId(), JsonPath.read(response, "$[0].team_id"));
  }

  @DisplayName("Given a valid scenario and team, should add player to team successfully")
  @Test
  @WithMockAdminUser
  void given_validScenarioAndTeam_should_addPlayerToTeamSuccessfully() throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName(TEAM_NAME);
    Team teamCreated = this.teamRepository.save(team);

    Scenario scenario = getScenario();
    scenario.setTeams(List.of(teamCreated));
    Scenario scenarioCreated = this.scenarioRepository.save(scenario);

    User user = UserFixture.getUser();
    User userCreated = this.userRepository.save(user);

    ScenarioTeamPlayersEnableInput input = new ScenarioTeamPlayersEnableInput();
    input.setPlayersIds(List.of(userCreated.getId()));

    // -- EXECUTE --
    this.mvc
        .perform(
            put(SCENARIO_URI
                    + "/"
                    + scenarioCreated.getId()
                    + "/teams/"
                    + teamCreated.getId()
                    + "/players/add")
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    List<ScenarioTeamUser> scenarioTeamUsers =
        fromIterable(this.scenarioTeamUserRepository.findAll());
    assertTrue(!scenarioTeamUsers.isEmpty());
    assertTrue(
        scenarioTeamUsers.stream().anyMatch(s -> userCreated.getId().equals(s.getUser().getId())));
  }

  @DisplayName(
      "Given a valid scenario and team with a player, should remove player from team successfully")
  @Test
  @WithMockAdminUser
  void given_validScenarioAndTeamWithPlayer_should_removePlayerFromTeamSuccessfully()
      throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName(TEAM_NAME);
    Team teamCreated = this.teamRepository.save(team);

    Scenario scenario = getScenario();
    scenario.setTeams(List.of(teamCreated));
    Scenario scenarioCreated = this.scenarioRepository.save(scenario);

    User user = UserFixture.getUser();
    User userCreated = this.userRepository.save(user);

    ScenarioTeamUser scenarioTeamUser = new ScenarioTeamUser();
    scenarioTeamUser.setScenario(scenarioCreated);
    scenarioTeamUser.setTeam(teamCreated);
    scenarioTeamUser.setUser(userCreated);
    this.scenarioTeamUserRepository.save(scenarioTeamUser);

    ExerciseTeamPlayersEnableInput input = new ExerciseTeamPlayersEnableInput();
    input.setPlayersIds(List.of(userCreated.getId()));

    // -- EXECUTE --
    this.mvc
        .perform(
            put(SCENARIO_URI
                    + "/"
                    + scenarioCreated.getId()
                    + "/teams/"
                    + teamCreated.getId()
                    + "/players/remove")
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    List<ScenarioTeamUser> scenarioTeamUsers =
        fromIterable(this.scenarioTeamUserRepository.findAll());
    assertTrue(!scenarioTeamUsers.isEmpty());
    assertFalse(scenarioTeamUsers.stream().anyMatch(s -> s.getScenario() == null));
  }

  @DisplayName("Given a valid scenario with a team, should remove team from scenario successfully")
  @Test
  @WithMockAdminUser
  void given_validScenarioWithTeam_should_removeTeamFromScenarioSuccessfully() throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName(TEAM_NAME);
    Team teamCreated = this.teamRepository.save(team);

    Scenario scenario = getScenario();
    scenario.setTeams(List.of(teamCreated));
    Scenario scenarioCreated = this.scenarioRepository.save(scenario);

    ScenarioUpdateTeamsInput input = new ScenarioUpdateTeamsInput();
    input.setTeamIds(List.of(teamCreated.getId()));

    // -- EXECUTE --
    this.mvc
        .perform(
            put(SCENARIO_URI + "/" + scenarioCreated.getId() + "/teams/remove")
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    List<Team> teams = this.teamRepository.findAll(fromScenario(scenarioCreated.getId()));
    assertTrue(teams.isEmpty());
  }
}
