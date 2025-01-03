package io.openbas.rest;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exercise.form.ScenarioTeamPlayersEnableInput;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.rest.scenario.form.ScenarioUpdateTeamsInput;
import io.openbas.rest.team.form.TeamCreateInput;
import io.openbas.service.ScenarioService;
import io.openbas.utils.fixtures.TeamFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import jakarta.servlet.ServletException;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class TeamApiTest {

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioService scenarioService;
  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private ExerciseService exerciseService;
  @Autowired private ExerciseRepository exerciseRepository;
  @Autowired private TeamRepository teamRepository;
  @Autowired private UserRepository userRepository;

  static String SCENARIO_ID;
  static String TEAM_ID;
  static String USER_ID;
  static TeamCreateInput TEAM_INPUT;
  static Team TEAM;

  // -- SCENARIOS --

  @DisplayName("Add a team on a scenario")
  @Test
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
    String response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/add")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response =
        this.mvc
            .perform(get(SCENARIO_URI + "/" + SCENARIO_ID).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(TEAM_ID, JsonPath.read(response, "$.scenario_teams[0]"));

    // --THEN--
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.teamRepository.deleteById(TEAM_ID);
  }

  @DisplayName("Retrieve teams on a scenario")
  @Test
  @WithMockObserverUser
  void retrieveTeamsOnScenarioTest() throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName("My team");
    team = this.teamRepository.save(team);
    TEAM_ID = team.getId();

    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    scenario.setTeams(List.of(team));
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                get(SCENARIO_URI + "/" + SCENARIO_ID + "/teams").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(TEAM_ID, JsonPath.read(response, "$[0].team_id"));

    // --THEN--
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.teamRepository.deleteById(TEAM_ID);
  }

  @DisplayName("Add a player to a team on a scenario")
  @Test
  @WithMockPlannerUser
  void addPlayerOnTeamOnScenarioTest() throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName("My team");
    team = this.teamRepository.save(team);
    TEAM_ID = team.getId();

    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    scenario.setTeams(List.of(team));
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    User user = new User();
    user.setEmail("testfiligran@gmail.com");
    user = this.userRepository.save(user);
    USER_ID = user.getId();

    ScenarioTeamPlayersEnableInput input = new ScenarioTeamPlayersEnableInput();
    input.setPlayersIds(List.of(USER_ID));

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/" + TEAM_ID + "/players/add")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response =
        this.mvc
            .perform(get(SCENARIO_URI + "/" + SCENARIO_ID).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(USER_ID, JsonPath.read(response, "$.scenario_teams_users[0].user_id"));

    // --THEN--
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.teamRepository.deleteById(TEAM_ID);
    this.userRepository.deleteById(USER_ID);
  }

  @DisplayName("Remove a player to a team on a scenario")
  @Test
  @WithMockPlannerUser
  void removePlayerOnTeamOnScenarioTest() throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName("My team");
    team = this.teamRepository.save(team);
    TEAM_ID = team.getId();

    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    scenario.setTeams(List.of(team));
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    User user = new User();
    user.setEmail("testfiligran@gmail.com");
    user = this.userRepository.save(user);
    USER_ID = user.getId();

    ScenarioTeamPlayersEnableInput input = new ScenarioTeamPlayersEnableInput();
    input.setPlayersIds(List.of(USER_ID));

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/" + TEAM_ID + "/players/remove")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response =
        this.mvc
            .perform(get(SCENARIO_URI + "/" + SCENARIO_ID).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(new ArrayList<>(), JsonPath.read(response, "$.scenario_teams_users"));

    // --THEN--
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.teamRepository.deleteById(TEAM_ID);
    this.userRepository.deleteById(USER_ID);
  }

  @DisplayName("Remove a team on a scenario")
  @Test
  @WithMockPlannerUser
  void removeTeamOnScenarioTest() throws Exception {
    // -- PREPARE --
    Team team = new Team();
    team.setName("My team");
    team = this.teamRepository.save(team);
    TEAM_ID = team.getId();

    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    scenario.setTeams(List.of(team));
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    ScenarioUpdateTeamsInput input = new ScenarioUpdateTeamsInput();
    input.setTeamIds(
        new ArrayList<>() {
          {
            add(TEAM_ID);
          }
        });

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID + "/teams/remove")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    response =
        this.mvc
            .perform(get(SCENARIO_URI + "/" + SCENARIO_ID).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(new ArrayList<>(), JsonPath.read(response, "$.scenario_teams"));

    // --THEN--
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.teamRepository.deleteById(TEAM_ID);
  }

  @DisplayName("Creation of a team")
  @Test
  @WithMockAdminUser
  void createTeamTest() throws Exception {
    // --PREPARE--
    TEAM_INPUT = TeamFixture.createTeam();

    // --EXECUTE--
    String response =
        mvc.perform(
                post("/api/teams")
                    .content(asJsonString(TEAM_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("Test team", JsonPath.read(response, "$.team_name"));

    // --THEN--
    teamRepository.deleteById(JsonPath.read(response, "$.team_id"));
  }

  @DisplayName("Creation of a global team with an existing name")
  @Test
  @WithMockAdminUser
  void createGlobalTeamTest() throws Exception {
    // --PREPARE--
    TEAM_INPUT = TeamFixture.createTeam();

    Team team = new Team();
    team.setName("Test team");
    team = this.teamRepository.save(team);
    String teamId = team.getId();

    // --EXECUTE--
    String response =
        mvc.perform(
                post("/api/teams")
                    .content(asJsonString(TEAM_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is4xxClientError())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(
        "Global teams (non contextual) cannot have the same name (already exists)",
        JsonPath.read(response, "$.message"));

    // --THEN--
    teamRepository.deleteById(teamId);
  }

  @DisplayName("Creation of a contextual team (exercise)")
  @Test
  @WithMockAdminUser
  void createContextualTeamTest() throws Exception {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    exercise.setName("Exercise name");
    Exercise exerciseCreated = this.exerciseService.createExercise(exercise);
    String exerciseId = exerciseCreated.getId();

    TeamCreateInput teamInput = TeamFixture.createContextualExerciseTeam(List.of(exerciseId));

    // --EXECUTE--
    String response =
        mvc.perform(
                post("/api/teams")
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("Exercise team", JsonPath.read(response, "$.team_name"));

    // --THEN--
    teamRepository.deleteById(JsonPath.read(response, "$.team_id"));
    exerciseRepository.deleteById(exerciseId);
  }

  @DisplayName("Creation of a contextual team with an existing name (exercise)")
  @Test
  @WithMockAdminUser
  void createExerciseTeamTest() throws Exception {
    // -- PREPARE --
    Exercise exercise = new Exercise();
    exercise.setName("Exercise name");
    Exercise exerciseCreated = this.exerciseService.createExercise(exercise);
    String exerciseId = exerciseCreated.getId();

    Team team = new Team();
    team.setName("Exercise team");
    team.setContextual(true);
    team.setExercises(List.of(exerciseCreated));
    Team teamCreated = this.teamRepository.save(team);
    String teamId = teamCreated.getId();

    TeamCreateInput teamInput = TeamFixture.createContextualExerciseTeam(List.of(exerciseId));

    // --EXECUTE--
    String response =
        mvc.perform(
                post("/api/teams")
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is4xxClientError())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(
        "A contextual team with the same name already exists on this simulation",
        JsonPath.read(response, "$.message"));

    // --THEN--
    teamRepository.deleteById(teamId);
    exerciseRepository.deleteById(exerciseId);
  }

  @DisplayName("Creation of a contextual team with an existing name (scenario)")
  @Test
  @WithMockAdminUser
  void createScenarioGlobalTeamTest() throws Exception {
    // -- PREPARE --
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    String scenarioId = scenarioCreated.getId();

    Team team = new Team();
    team.setName("Scenario team");
    team.setContextual(true);
    team.setScenarios(List.of(scenarioCreated));
    team = this.teamRepository.save(team);
    String teamId = team.getId();

    TeamCreateInput teamInput = TeamFixture.createContextualScenarioTeam(List.of(scenarioId));

    // --EXECUTE--
    String response =
        mvc.perform(
                post("/api/teams")
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is4xxClientError())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(
        "A contextual team with the same name already exists on this scenario",
        JsonPath.read(response, "$.message"));

    // --THEN--
    teamRepository.deleteById(teamId);
    scenarioRepository.deleteById(scenarioId);
  }

  @DisplayName("Edition of a team")
  @Test
  @WithMockAdminUser
  void updateTeamTest() throws Exception {
    // --PREPARE--
    TEAM_INPUT = TeamFixture.createTeam();

    Team team = new Team();
    team.setUpdateAttributes(TEAM_INPUT);
    TEAM = teamRepository.save(team);
    String newName = "updatedName";
    TEAM_INPUT.setName(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                put("/api/teams/" + TEAM.getId())
                    .content(asJsonString(TEAM_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("updatedName", JsonPath.read(response, "$.team_name"));
    // --THEN--
    teamRepository.deleteById(JsonPath.read(response, "$.team_id"));
  }

  @DisplayName("Upsert of a global team")
  @Test
  @WithMockAdminUser
  void upsertGlobalTeamTest() throws Exception {
    // --PREPARE--
    TEAM_INPUT = TeamFixture.createTeam();

    Team team = new Team();
    team.setUpdateAttributes(TEAM_INPUT);
    TEAM = teamRepository.save(team);
    String newName = "updatedName";
    TEAM_INPUT.setName(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                post("/api/teams/upsert")
                    .content(asJsonString(TEAM_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("updatedName", JsonPath.read(response, "$.team_name"));
    // --THEN--
    teamRepository.deleteById(JsonPath.read(response, "$.team_id"));
  }

  @DisplayName("Upsert of a non existing global team")
  @Test
  @WithMockAdminUser
  void upsertNonExistingGlobalTeamTest() throws Exception {
    // --PREPARE--
    TEAM_INPUT = TeamFixture.createTeam();

    Team team = new Team();
    team.setName("Name");
    TEAM = teamRepository.save(team);

    // --EXECUTE--
    String response =
        mvc.perform(
                post("/api/teams/upsert")
                    .content(asJsonString(TEAM_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("Test team", JsonPath.read(response, "$.team_name"));
    // --THEN--
    teamRepository.deleteById(JsonPath.read(response, "$.team_id"));
  }

  @DisplayName("Upsert of a contextual team with many exercices")
  @Test
  @WithMockAdminUser
  void upsertContextualTeamTest() throws Exception {
    // -- PREPARE --
    Exercise exercise1 = new Exercise();
    exercise1.setName("Exercise name1");
    Exercise exerciseCreated1 = this.exerciseService.createExercise(exercise1);
    String exerciseId1 = exerciseCreated1.getId();

    Exercise exercise2 = new Exercise();
    exercise2.setName("Exercise name2");
    Exercise exerciseCreated2 = this.exerciseService.createExercise(exercise2);
    String exerciseId2 = exerciseCreated2.getId();

    Team team = new Team();
    team.setName("Exercise team");
    team.setContextual(true);
    team.setExercises(List.of(exerciseCreated1, exerciseCreated2));
    Team teamCreated = this.teamRepository.save(team);
    String teamId = teamCreated.getId();

    TeamCreateInput teamInput =
        TeamFixture.createContextualExerciseTeam(List.of(exerciseId1, exerciseId2));

    // --EXECUTE--
    Exception exception =
        assertThrows(
            ServletException.class,
            () ->
                mvc.perform(
                    post("/api/teams/upsert")
                        .content(asJsonString(teamInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)));

    String expectedMessage = "Contextual team can only be associated to one exercise";
    String actualMessage = exception.getMessage();

    // --ASSERT--
    assertTrue(actualMessage.contains(expectedMessage));

    // --THEN--
    teamRepository.deleteById(teamId);
    exerciseRepository.deleteById(exerciseId1);
    exerciseRepository.deleteById(exerciseId2);
  }
}
