package io.openbas.rest;

import static io.openbas.rest.team.TeamApi.TEAM_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.TeamFixture.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Team;
import io.openbas.database.repository.TeamRepository;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.rest.team.form.TeamCreateInput;
import io.openbas.utils.fixtures.ExerciseFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.servlet.ServletException;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(PER_CLASS)
@Transactional
class TeamApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;

  @Autowired private ExerciseService exerciseService;
  @Autowired private TeamRepository teamRepository;

  @DisplayName("Given valid team input, should create a team successfully")
  @Test
  @WithMockAdminUser
  void given_validTeamInput_should_createTeamSuccessfully() throws Exception {
    // --PREPARE--
    TeamCreateInput teamInput = createTeam();

    // --EXECUTE--
    String response =
        mvc.perform(
                post(TEAM_URI)
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(teamInput.getName(), JsonPath.read(response, "$.team_name"));
    assertEquals(teamInput.getDescription(), JsonPath.read(response, "$.team_description"));
  }

  @DisplayName("Given existing team name input, should throw an exception")
  @Test
  @WithMockAdminUser
  void given_existingTeamNameInput_should_throwAnException() throws Exception {
    // --PREPARE--
    Team team = new Team();
    team.setName(TEAM_NAME);
    this.teamRepository.save(team);

    TeamCreateInput teamInput = createTeam();

    // --EXECUTE--
    String response =
        mvc.perform(
                post(TEAM_URI)
                    .content(asJsonString(teamInput))
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
  }

  @DisplayName("Given valid contextual team input, should create a contextual team successfully")
  @Test
  @WithMockAdminUser
  void given_validContextualTeamInput_should_createContextualTeamSuccessfully() throws Exception {
    // -- PREPARE --
    Exercise exercise = ExerciseFixture.getExercise();
    exercise = this.exerciseService.createExercise(exercise);

    TeamCreateInput teamInput = createContextualExerciseTeam(List.of(exercise.getId()));

    // --EXECUTE--
    String response =
        mvc.perform(
                post(TEAM_URI)
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(CONTEXTUAL_TEAM_NAME, JsonPath.read(response, "$.team_name"));
  }

  @DisplayName("Given existing contextual team name input, should throw an exception")
  @Test
  @WithMockAdminUser
  void given_existingContextualTeamNameInput_should_throwAnException() throws Exception {
    // -- PREPARE --
    Exercise exercise = ExerciseFixture.getExercise();
    exercise = this.exerciseService.createExercise(exercise);
    Team team = new Team();
    team.setName(CONTEXTUAL_TEAM_NAME);
    team.setContextual(true);
    team.setExercises(List.of(exercise));
    this.teamRepository.save(team);

    TeamCreateInput teamInput = createContextualExerciseTeam(List.of(exercise.getId()));

    // --EXECUTE--
    String response =
        mvc.perform(
                post(TEAM_URI)
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
  }

  @DisplayName("Given valid team ID and input, should update team successfully")
  @Test
  @WithMockAdminUser
  void given_validTeamIdAndInput_should_updateTeamSuccessfully() throws Exception {
    // --PREPARE--
    TeamCreateInput teamInput = createTeam();

    Team team = new Team();
    team.setUpdateAttributes(teamInput);
    team = teamRepository.save(team);
    String newName = "updatedName";
    teamInput.setName(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(TEAM_URI + "/" + team.getId())
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(newName, JsonPath.read(response, "$.team_name"));
  }

  @DisplayName("Given valid team ID and input, should upsert team successfully")
  @Test
  @WithMockAdminUser
  void given_validTeamIdAndInput_should_upsertTeamSuccessfully() throws Exception {
    // --PREPARE--
    TeamCreateInput teamInput = createTeam();

    Team team = new Team();
    team.setUpdateAttributes(teamInput);
    teamRepository.save(team);
    String newName = "updatedName";
    teamInput.setName(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                post(TEAM_URI + "/upsert")
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(newName, JsonPath.read(response, "$.team_name"));
    // --THEN--
    teamRepository.deleteById(JsonPath.read(response, "$.team_id"));
  }

  @DisplayName("Given non existing and team input, should upsert team successfully")
  @Test
  @WithMockAdminUser
  void given_nonExistingTeamInput_should_upsertTeamSuccessfully() throws Exception {
    // --PREPARE--
    TeamCreateInput teamInput = createTeam();

    // --EXECUTE--
    String response =
        mvc.perform(
                post(TEAM_URI + "/upsert")
                    .content(asJsonString(teamInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(TEAM_NAME, JsonPath.read(response, "$.team_name"));
  }

  @DisplayName("Given contextual team input with multiple exercise, should throw an exception")
  @Test
  @WithMockAdminUser
  void given_contextualTeamWithMultipleExercise_should_throwAnException() {
    // -- PREPARE --
    Exercise exercise1 = ExerciseFixture.getExercise();
    exercise1.setName("exercise 1");
    exercise1 = this.exerciseService.createExercise(exercise1);
    Exercise exercise2 = ExerciseFixture.getExercise();
    exercise2.setName("exercise 2");
    exercise2 = this.exerciseService.createExercise(exercise2);

    TeamCreateInput teamInput =
        createContextualExerciseTeam(List.of(exercise1.getId(), exercise2.getId()));

    // --EXECUTE--
    Exception exception =
        assertThrows(
            ServletException.class,
            () ->
                mvc.perform(
                    post(TEAM_URI + "/upsert")
                        .content(asJsonString(teamInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)));

    String expectedMessage = "Contextual team can only be associated to one exercise";
    String actualMessage = exception.getMessage();

    // --ASSERT--
    assertTrue(actualMessage.contains(expectedMessage));
  }
}
