package io.openbas.rest;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.LessonsCategoryRepository;
import io.openbas.database.repository.TeamRepository;
import io.openbas.database.repository.UserRepository;
import io.openbas.rest.exercise.ExerciseService;
import io.openbas.rest.lessons.form.LessonsSendInput;
import io.openbas.service.MailingService;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static io.openbas.database.model.ExerciseStatus.SCHEDULED;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.Mockito.*;


@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ExerciseLessonsApiTest extends IntegrationTest {

  static Exercise EXERCISE;
  static LessonsCategory LESSONCATEGORY;
  static Team TEAM;
  static User USER;

  @Autowired
  private MockMvc mvc;
  @Autowired
  private ExerciseService exerciseService;
  @Autowired
  private ExerciseRepository exerciseRepository;
  @Autowired
  private LessonsCategoryRepository lessonsCategoryRepository;
  @SpyBean
  private MailingService mailingService;
  @Autowired
  private TeamRepository teamRepository;
  @Autowired
  private UserRepository userRepository;

  @BeforeAll
  void beforeAll() {
    EXERCISE = getExercise();
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
    LessonsCategory lessonsCategory = new LessonsCategory();
    lessonsCategory.setExercise(EXERCISE);
    lessonsCategory.setName("Category");
    lessonsCategory.setDescription("Description");
    lessonsCategory.setOrder(0);
    lessonsCategory.setTeams(List.of(getTeam()));
    return this.lessonsCategoryRepository.save(lessonsCategory);
  }

  private Team getTeam() {
    Team team = new Team();
    team.setName("My team");

    User user = new User();
    user.setEmail("testSurvey@gmail.com");
    USER = this.userRepository.save(user);

    team.setUsers(List.of(USER));
    TEAM = this.teamRepository.save(team);
    return TEAM;
  }

  private Exercise getExercise() {
    Exercise exercise = new Exercise();
    exercise.setName("Exercice name");
    exercise.setStatus(SCHEDULED);
    exercise.setFrom("test@test.com");
    exercise.setReplyTos(List.of("test@test.com"));
    exercise.setStart(Instant.now());
    return this.exerciseService.createExercise(exercise);
  }

  @DisplayName("Send surveys for exercise lessons")
  @Test
  @Order(1)
  @WithMockPlannerUser
  void sendExerciseLessonsTest() throws Exception {

    // -- PREPARE --
    String lessonSubject = "Subject";
    String lessonBody = "This is a lesson";
    LessonsSendInput lessonsSendInput = new LessonsSendInput();
    lessonsSendInput.setSubject(lessonSubject);
    lessonsSendInput.setBody(lessonBody);
    User user = userRepository.findById(LESSONCATEGORY.getUsers().getFirst()).orElseThrow();

    // -- EXECUTE --
    mvc.perform(post(EXERCISE_URI + "/" + EXERCISE.getId() + "/lessons_send")
            .content(asJsonString(lessonsSendInput))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    // -- ASSERT --
    verify(mailingService).sendEmail(lessonSubject, lessonBody, List.of(user),
        exerciseRepository.findById(EXERCISE.getId()));
  }


}
