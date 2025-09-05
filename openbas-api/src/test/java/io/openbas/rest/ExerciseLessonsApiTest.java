package io.openbas.rest;

import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.ExerciseFixture.getExercise;
import static io.openbas.utils.fixtures.ExerciseLessonsCategoryFixture.getLessonsCategory;
import static io.openbas.utils.fixtures.TeamFixture.getTeam;
import static io.openbas.utils.fixtures.UserFixture.getUser;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.LessonsCategory;
import io.openbas.database.model.Team;
import io.openbas.database.model.User;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.LessonsCategoryRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.rest.lessons.form.LessonsSendInput;
import io.openbas.service.MailingService;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ExerciseLessonsApiTest extends IntegrationTest {

  static Exercise EXERCISE;
  static LessonsCategory LESSONCATEGORY;
  static Team TEAM;
  static User USER;

  @Autowired private MockMvc mvc;
  @Autowired private ExerciseService exerciseService;
  @Autowired private ExerciseRepository exerciseRepository;
  @Autowired private LessonsCategoryRepository lessonsCategoryRepository;
  @SpyBean private MailingService mailingService;
  @Autowired private TeamRepository teamRepository;
  @Autowired private UserRepository userRepository;

  @BeforeAll
  void beforeAll() {
    LESSONCATEGORY = getLessonCategory();
  }

  @AfterAll
  void afterAll() {
    this.exerciseRepository.delete(EXERCISE);
    this.lessonsCategoryRepository.delete(LESSONCATEGORY);
    this.teamRepository.delete(TEAM);
    this.userRepository.delete(USER);
  }

  private LessonsCategory getLessonCategory() {
    USER = this.userRepository.save(getUser());
    TEAM = teamRepository.save(getTeam(USER, "My team", false));
    EXERCISE = this.exerciseService.createExercise(getExercise(List.of(TEAM)));
    return this.lessonsCategoryRepository.save(getLessonsCategory(EXERCISE, List.of(TEAM)));
  }

  @DisplayName("Send surveys for exercise lessons")
  @Test
  @WithMockAdminUser
  void sendExerciseLessonsTest() throws Exception {

    // -- PREPARE --
    String lessonSubject = "Subject";
    String lessonBody = "This is a lesson";
    LessonsSendInput lessonsSendInput = new LessonsSendInput();
    lessonsSendInput.setSubject(lessonSubject);
    lessonsSendInput.setBody(lessonBody);
    User user = userRepository.findById(LESSONCATEGORY.getUsers().getFirst()).orElseThrow();

    // -- EXECUTE --
    mvc.perform(
            post(EXERCISE_URI + "/" + EXERCISE.getId() + "/lessons_send")
                .content(asJsonString(lessonsSendInput))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    // -- ASSERT --
    verify(mailingService)
        .sendEmail(
            lessonSubject,
            lessonBody,
            List.of(user),
            exerciseRepository.findById(EXERCISE.getId()));
  }
}
