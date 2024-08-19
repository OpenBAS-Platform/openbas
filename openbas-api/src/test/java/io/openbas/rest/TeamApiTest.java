package io.openbas.rest;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exercise.form.ScenarioTeamPlayersEnableInput;
import io.openbas.rest.scenario.form.ScenarioUpdateTeamsInput;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import io.openbas.service.ScenarioService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class TeamApiTest {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private ScenarioService scenarioService;
  @Autowired
  private ScenarioRepository scenarioRepository;
  @Autowired
  private TeamRepository teamRepository;
  @Autowired
  private UserRepository userRepository;

  static String SCENARIO_ID;
  static String TEAM_ID;
  static String USER_ID;

  @AfterAll
  void afterAll() {
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.teamRepository.deleteById(TEAM_ID);
    this.userRepository.deleteById(USER_ID);
  }

  // -- SCENARIOS --

  @DisplayName("Add a team on a scenario")
  @Test
  @Order(1)
  @WithMockPlannerUser
  void addTeamOnScenarioTest() throws Exception {
    // -- PREPARE --
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    Team team = new Team();
    team.setName("My team");
    team = this.teamRepository.save(team);
    TEAM_ID = team.getId();

    ScenarioUpdateTeamsInput input = new ScenarioUpdateTeamsInput();
    input.setTeamIds(List.of(TEAM_ID));

    // -- EXECUTE --
    String response = this.mvc
        .perform(put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/add")
            .content(asJsonString(input))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response = this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    assertEquals(TEAM_ID, JsonPath.read(response, "$.scenario_teams[0]"));
  }

  @DisplayName("Retrieve teams on a scenario")
  @Test
  @Order(2)
  @WithMockObserverUser
  void retrieveTeamsOnScenarioTest() throws Exception {
    // -- EXECUTE --
    String response = this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID + "/teams")
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(TEAM_ID, JsonPath.read(response, "$[0].team_id"));
  }

  @DisplayName("Add a player to a team on a scenario")
  @Test
  @Order(3)
  @WithMockPlannerUser
  void addPlayerOnTeamOnScenarioTest() throws Exception {
    // -- PREPARE --
    User user = new User();
    user.setEmail("testfiligran@gmail.com");
    user = this.userRepository.save(user);
    USER_ID = user.getId();
    ScenarioTeamPlayersEnableInput input = new ScenarioTeamPlayersEnableInput();
    input.setPlayersIds(List.of(USER_ID));

    // -- EXECUTE --
    String response = this.mvc
        .perform(put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/" + TEAM_ID + "/players/add")
            .content(asJsonString(input))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response = this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    assertEquals(USER_ID, JsonPath.read(response, "$.scenario_teams_users[0].user_id"));
  }

  @DisplayName("Remove a player to a team on a scenario")
  @Test
  @Order(4)
  @WithMockPlannerUser
  void removePlayerOnTeamOnScenarioTest() throws Exception {
    // -- PREPARE --
    ScenarioTeamPlayersEnableInput input = new ScenarioTeamPlayersEnableInput();
    input.setPlayersIds(List.of(USER_ID));

    // -- EXECUTE --
    String response = this.mvc
        .perform(put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/" + TEAM_ID + "/players/remove")
            .content(asJsonString(input))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response = this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    assertEquals(new ArrayList<>(), JsonPath.read(response, "$.scenario_teams_users"));
  }

  @DisplayName("Remove a team on a scenario")
  @Test
  @Order(5)
  @WithMockPlannerUser
  void removeTeamOnScenarioTest() throws Exception {
    // -- PREPARE --
    ScenarioUpdateTeamsInput input = new ScenarioUpdateTeamsInput();
    input.setTeamIds(new ArrayList<>() {{
      add(TEAM_ID);
    }});

    // -- EXECUTE --
    String response = this.mvc
        .perform(put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/remove")
            .content(asJsonString(input))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response = this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    assertEquals(new ArrayList<>(), JsonPath.read(response, "$.scenario_teams"));
  }
}
