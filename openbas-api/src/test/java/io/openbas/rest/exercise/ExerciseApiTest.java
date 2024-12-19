package io.openbas.rest.exercise;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.ExerciseTeamUser;
import io.openbas.database.model.Tag;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.*;
import io.openbas.rest.exercise.form.ExerciseUpdateTagsInput;
import io.openbas.rest.exercise.form.ExercisesGlobalScoresInput;
import io.openbas.rest.exercise.form.UpdateExerciseInput;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.utils.fixtures.ExerciseFixture;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.fixtures.TeamFixture;
import io.openbas.utils.fixtures.UserFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.*;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class ExerciseApiTest {
  @Autowired private MockMvc mvc;

  @Autowired private ExerciseRepository exerciseRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private TeamRepository teamRepository;

  @Autowired private ExerciseTeamUserRepository exerciseTeamUserRepository;

  @Mock ExerciseRepository exerciseRepositoryMock;
  @Mock TagRepository tagRepositoryMock;
  @Mock ExerciseService exerciseServiceMock;
  @InjectMocks private ExerciseApi exerciseApi;

  private static final List<String> EXERCISE_IDS = new ArrayList<>();
  private static final List<String> USER_IDS = new ArrayList<>();
  private static final List<String> TEAM_IDS = new ArrayList<>();

  void cleanup() {
    this.exerciseRepository.deleteAllById(EXERCISE_IDS);
    this.userRepository.deleteAllById(USER_IDS);
    this.teamRepository.deleteAllById(TEAM_IDS);
  }

  @Nested
  @DisplayName("Retrieving exercise informations")
  class RetrievingExercises {
    @Test
    @DisplayName("Retrieving players by exercise")
    @WithMockAdminUser
    void retrievingPlayersByExercise() throws Exception {
      // -- PREPARE --
      User userTom = userRepository.save(UserFixture.getUser("Tom", "TEST", "tom-test@fake.email"));
      User userBen = userRepository.save(UserFixture.getUser("Ben", "TEST", "ben-test@fake.email"));
      USER_IDS.addAll(Arrays.asList(userTom.getId(), userBen.getId()));
      Team teamA = teamRepository.save(TeamFixture.getTeam(userTom, "TeamA", false));
      Team teamB = teamRepository.save(TeamFixture.getTeam(userBen, "TeamB", false));
      TEAM_IDS.addAll(Arrays.asList(teamA.getId(), teamB.getId()));

      Exercise exercise = ExerciseFixture.createDefaultCrisisExercise();
      exercise.setTeams(Arrays.asList(teamA, teamB));
      Exercise exerciseSaved = exerciseRepository.save(exercise);
      EXERCISE_IDS.add(exerciseSaved.getId());

      ExerciseTeamUser exerciseTeamUser = new ExerciseTeamUser();
      exerciseTeamUser.setExercise(exerciseSaved);
      exerciseTeamUser.setTeam(teamA);
      exerciseTeamUser.setUser(userTom);
      ExerciseTeamUser exerciseTeamUser2 = new ExerciseTeamUser();
      exerciseTeamUser2.setExercise(exerciseSaved);
      exerciseTeamUser2.setTeam(teamB);
      exerciseTeamUser2.setUser(userBen);
      exerciseTeamUserRepository.saveAll(Arrays.asList(exerciseTeamUser, exerciseTeamUser2));

      mvc.perform(
              get(EXERCISE_URI + "/" + exerciseSaved.getId() + "/players")
                  .accept(MediaType.APPLICATION_JSON))
          .andExpect(status().is2xxSuccessful())
          .andExpect(jsonPath("$.length()").value(2))
          .andExpect(
              jsonPath("$[*].user_id")
                  .value(
                      org.hamcrest.Matchers.containsInAnyOrder(userTom.getId(), userBen.getId())));

      cleanup();
    }

    @Test
    @DisplayName("Get global score for exercises")
    @WithMockAdminUser
    void getGlobalScoreForExercises() throws Exception {
      Exercise exercise1 = ExerciseFixture.createDefaultCrisisExercise();
      Exercise exercise1Saved = exerciseRepository.save(exercise1);
      EXERCISE_IDS.add(exercise1Saved.getId());

      Exercise exercise2 = ExerciseFixture.createDefaultIncidentResponseExercise();
      Exercise exercise2Saved = exerciseRepository.save(exercise2);
      EXERCISE_IDS.add(exercise2Saved.getId());

      ExercisesGlobalScoresInput input =
          new ExercisesGlobalScoresInput(List.of(exercise1Saved.getId(), exercise2Saved.getId()));

      String response =
          mvc.perform(
                  post(EXERCISE_URI + "/global-scores")
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(asJsonString(input)))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      assertEquals(
          "[]",
          JsonPath.read(response, "$.global_scores_by_exercise_ids." + exercise1Saved.getId())
              .toString());
      assertEquals(
          "[]",
          JsonPath.read(response, "$.global_scores_by_exercise_ids." + exercise2Saved.getId())
              .toString());

      cleanup();
    }
  }

  @DisplayName("Update with apply rule")
  @Test
  public void testUpdateExercise_WITH_apply_rule_true() {
    Tag tag1 = TagFixture.getTag("Tag1");
    Tag tag2 = TagFixture.getTag("Tag2");
    Tag tag3 = TagFixture.getTag("Tag3");

    Exercise exercise = ExerciseFixture.createDefaultCrisisExercise();
    exercise.setTags(Set.of(tag2, tag3, tag1));
    exercise.setId("test");
    UpdateExerciseInput input = new UpdateExerciseInput();
    input.setDescription("test");
    input.setApplyTagRule(true);
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));

    Exercise expected = ExerciseFixture.createDefaultCrisisExercise();
    expected.setId("test");
    expected.setDescription("test");
    expected.setTags(Set.of(tag1, tag2));

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(Optional.of(exercise)).when(exerciseRepositoryMock).findById(exercise.getId());

    exerciseApi.updateExerciseInformation(exercise.getId(), input);

    verify(exerciseServiceMock).updateExerciceAndApplyRule(expected, Set.of(tag2, tag3, tag1));
  }

  @DisplayName("Update without apply rule")
  @Test
  public void testUpdateExercise_WITH_apply_rule_false() throws Exception {
    Tag tag1 = TagFixture.getTag("Tag1");
    Tag tag2 = TagFixture.getTag("Tag2");
    Tag tag3 = TagFixture.getTag("Tag3");

    Exercise exercise = ExerciseFixture.createDefaultCrisisExercise();
    exercise.setTags(Set.of(tag2, tag3, tag1));
    exercise.setId("test");
    UpdateExerciseInput input = new UpdateExerciseInput();
    input.setDescription("test");
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));

    Exercise expected = ExerciseFixture.createDefaultCrisisExercise();
    expected.setId("test");
    expected.setDescription("test");
    expected.setTags(Set.of(tag1, tag2));

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(Optional.of(exercise)).when(exerciseRepositoryMock).findById(exercise.getId());

    exerciseApi.updateExerciseInformation(exercise.getId(), input);

    verify(exerciseRepositoryMock).save(expected);
  }

  @DisplayName("Update tags without apply rule")
  @Test
  public void testUpdateExerciseTags_WITH_apply_rule_false() {
    Tag tag1 = TagFixture.getTag("Tag1");
    Tag tag2 = TagFixture.getTag("Tag2");
    Tag tag3 = TagFixture.getTag("Tag3");

    Exercise exercise = ExerciseFixture.createDefaultCrisisExercise();
    exercise.setTags(Set.of(tag2, tag3, tag1));
    exercise.setId("test");

    ExerciseUpdateTagsInput input = new ExerciseUpdateTagsInput();
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));

    Exercise expected = ExerciseFixture.createDefaultCrisisExercise();
    expected.setTags(Set.of(tag1, tag2));
    expected.setId("test");

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(Optional.of(exercise)).when(exerciseRepositoryMock).findById(exercise.getId());

    exerciseApi.updateExerciseTags(exercise.getId(), input);

    verify(exerciseRepositoryMock).save(expected);
  }

  @DisplayName("Update tags with apply rule")
  @Test
  public void testUpdateExerciseTags_WITH_apply_rule_true() {
    Tag tag1 = TagFixture.getTag("Tag1");
    Tag tag2 = TagFixture.getTag("Tag2");
    Tag tag3 = TagFixture.getTag("Tag3");

    Exercise exercise = ExerciseFixture.createDefaultCrisisExercise();
    exercise.setTags(Set.of(tag2, tag3, tag1));
    exercise.setId("test");
    ExerciseUpdateTagsInput input = new ExerciseUpdateTagsInput();
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));
    input.setApplyTagRule(true);

    Exercise expected = ExerciseFixture.createDefaultCrisisExercise();
    expected.setTags(Set.of(tag1, tag2));
    expected.setId("test");

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(Optional.of(exercise)).when(exerciseRepositoryMock).findById(exercise.getId());

    exerciseApi.updateExerciseTags(exercise.getId(), input);

    verify(exerciseServiceMock).updateExerciceAndApplyRule(expected, Set.of(tag2, tag3, tag1));
  }
}
