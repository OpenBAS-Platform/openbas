package io.openbas.rest.exercise;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.InjectFixture.getInjectForEmailContract;
import static java.time.Instant.now;
import static java.time.temporal.ChronoUnit.MINUTES;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.helper.InjectHelper;
import io.openbas.injectors.email.model.EmailContent;
import io.openbas.rest.exercise.form.ExerciseUpdateStatusInput;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import jakarta.servlet.ServletException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(PER_CLASS)
public class ExerciseApiStatusTest {

  static Exercise SCHEDULED_EXERCISE;
  static Exercise RUNNING_EXERCISE;
  static Exercise PAUSED_EXERCISE;
  static Exercise FINISHED_EXERCISE;
  static Exercise CANCELED_EXERCISE;
  static Inject SAVED_INJECT5;
  static LessonsAnswer LESSON_ANSWER;

  @Autowired private MockMvc mvc;

  @Autowired private ExerciseRepository exerciseRepository;

  @Autowired private InjectRepository injectRepository;

  @Autowired private InjectorContractRepository injectorContractRepository;

  @Autowired private InjectStatusRepository injectStatusRepository;

  @Autowired private LessonsAnswerRepository lessonsAnswerRepository;

  @Autowired private LessonsCategoryRepository lessonsCategoryRepository;

  @Autowired private LessonsQuestionRepository lessonsQuestionRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private TeamRepository teamRepository;

  @Autowired private PauseRepository pauseRepository;

  @Autowired private InjectHelper injectHelper;

  @Resource protected ObjectMapper mapper;

  @BeforeAll
  void beforeAll() {
    Exercise scheduledExercise = ExerciseFixture.createDefaultAttackExercise();
    Exercise runningExercise = ExerciseFixture.createRunningAttackExercise();
    Exercise pausedExercise = ExerciseFixture.createPausedAttackExercise();
    Exercise canceledExercise = ExerciseFixture.createCanceledAttackExercise();
    Exercise finishedExercise = ExerciseFixture.createFinishedAttackExercise();

    InjectorContract injectorContract =
        this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow();
    Inject inject1 = getInjectForEmailContract(injectorContract);
    EmailContent content = new EmailContent();
    content.setSubject("Subject email");
    content.setBody("A body");
    inject1.setContent(this.mapper.valueToTree(content));
    inject1.setExercise(scheduledExercise);

    Inject inject2 = getInjectForEmailContract(injectorContract);
    inject2.setContent(this.mapper.valueToTree(content));
    inject2.setExercise(runningExercise);

    Inject inject3 = getInjectForEmailContract(injectorContract);
    inject3.setContent(this.mapper.valueToTree(content));
    inject3.setExercise(pausedExercise);

    Inject inject4 = getInjectForEmailContract(injectorContract);
    inject4.setContent(this.mapper.valueToTree(content));
    inject4.setExercise(canceledExercise);

    Inject inject5 = getInjectForEmailContract(injectorContract);
    inject5.setContent(this.mapper.valueToTree(content));
    inject5.setExercise(finishedExercise);

    User user = userRepository.save(UserFixture.getUser("Tom", "TEST", "tom-test@fake.email"));
    Team team = TeamFixture.getTeam(user, "TeamA", true);
    team.setExercises(
        Arrays.asList(
            scheduledExercise,
            runningExercise,
            pausedExercise,
            canceledExercise,
            finishedExercise));
    SCHEDULED_EXERCISE = exerciseRepository.save(scheduledExercise);
    RUNNING_EXERCISE = exerciseRepository.save(runningExercise);
    PAUSED_EXERCISE = exerciseRepository.save(pausedExercise);
    FINISHED_EXERCISE = exerciseRepository.save(finishedExercise);
    CANCELED_EXERCISE = exerciseRepository.save(canceledExercise);
    teamRepository.save(team);

    inject1.setTeams(List.of(team));
    inject2.setTeams(List.of(team));
    inject3.setTeams(List.of(team));
    inject4.setTeams(List.of(team));
    inject5.setTeams(List.of(team));

    injectRepository.save(inject1);
    injectRepository.save(inject2);
    injectRepository.save(inject3);
    injectRepository.save(inject4);
    injectRepository.save(inject5);

    InjectStatus injectStatus = new InjectStatus();

    Pause pause = new Pause();
    Instant lastMinute = now().truncatedTo(MINUTES).minus(1, MINUTES);
    pause.setDate(lastMinute);

    LessonsAnswer lessonsAnswer = LessonsAnswerFixture.createLessonsAnswer();
    LessonsQuestion lessonsQuestion = LessonsQuestionFixture.createLessonsQuestion();
    LessonsCategory lessonsCategory = LessonsCategoryFixture.createLessonCategory();
    lessonsCategory.setExercise(FINISHED_EXERCISE);
    lessonsCategoryRepository.save(lessonsCategory);
    lessonsQuestion.setCategory(lessonsCategory);
    lessonsQuestionRepository.save(lessonsQuestion);
    lessonsAnswer.setQuestion(lessonsQuestion);
    LESSON_ANSWER = lessonsAnswerRepository.save(lessonsAnswer);

    injectStatus.setName(ExecutionStatus.ERROR);
    inject5.setStatus(injectStatus);
    FINISHED_EXERCISE.setInjects(List.of(inject5));
    FINISHED_EXERCISE.setPauses(List.of(pause));
    FINISHED_EXERCISE.setLessonsCategories(List.of(lessonsCategory));
  }

  @AfterAll
  void afterAll() {
    this.injectRepository.deleteAll();
    this.exerciseRepository.deleteAll();
    this.userRepository.deleteAll();
    this.teamRepository.deleteAll();
    this.lessonsAnswerRepository.deleteById(LESSON_ANSWER.getId());
    this.lessonsQuestionRepository.deleteAll();
    this.lessonsCategoryRepository.deleteAll();
  }

  @DisplayName("Start an exercise manually")
  @Test
  @WithMockAdminUser
  void manualStartExerciseTest() throws Exception {
    // -- PREPARE--
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.RUNNING);

    // -- EXECUTE --
    String response =
        mvc.perform(
                put(EXERCISE_URI + "/" + SCHEDULED_EXERCISE.getId() + "/status")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    List<ExecutableInject> injects = injectHelper.getInjectsToRun();
    Instant nextMinute = now().truncatedTo(MINUTES).plus(1, MINUTES);
    assertEquals(nextMinute.toString(), JsonPath.read(response, "$.exercise_start_date"));
    assertEquals(
        Arrays.asList(ExerciseStatus.CANCELED.name(), ExerciseStatus.PAUSED.name()),
        JsonPath.read(response, "$.exercise_next_possible_status"));
    assertEquals(1, injects.size());
  }

  @DisplayName("Check an exercise from canceled to scheduled")
  @Test
  @WithMockAdminUser
  void rescheduledExerciseTest() throws Exception {
    // --PREPARE--
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.SCHEDULED);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(EXERCISE_URI + "/" + CANCELED_EXERCISE.getId() + "/status")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertNull(JsonPath.read(response, "$.exercise_start_date"));
    assertNull(JsonPath.read(response, "$.exercise_end_date"));
    assertEquals(
        List.of(ExerciseStatus.RUNNING.name()),
        JsonPath.read(response, "$.exercise_next_possible_status"));
  }

  @DisplayName("Check an exercise from finished to scheduled")
  @Test
  @WithMockAdminUser
  void rescheduledExerciseFromFinishedStateTest() throws Exception {
    // --PREPARE--
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.SCHEDULED);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(EXERCISE_URI + "/" + FINISHED_EXERCISE.getId() + "/status")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertNull(JsonPath.read(response, "$.exercise_start_date"));
    assertNull(JsonPath.read(response, "$.exercise_end_date"));
    assertEquals(
        List.of(ExerciseStatus.RUNNING.name()),
        JsonPath.read(response, "$.exercise_next_possible_status"));
  }

  @DisplayName("Check an exercise from pause to running")
  @Test
  @WithMockAdminUser
  void runExerciseAfterPauseTest() throws Exception {
    // --PREPARE--
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.RUNNING);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(EXERCISE_URI + "/" + PAUSED_EXERCISE.getId() + "/status")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    List<ExecutableInject> injects = injectHelper.getInjectsToRun();
    List<Pause> pauses = pauseRepository.findAllForExercise(PAUSED_EXERCISE.getId());
    Exercise responseExercise =
        exerciseRepository.findById(JsonPath.read(response, "$.exercise_id")).get();

    assertEquals(Optional.empty(), responseExercise.getCurrentPause());
    assertEquals(1, pauses.size());
    assertEquals(
        Arrays.asList(ExerciseStatus.CANCELED.name(), ExerciseStatus.PAUSED.name()),
        JsonPath.read(response, "$.exercise_next_possible_status"));
    assertEquals(1, injects.size());

    // --CLEAN--
    pauseRepository.delete(pauses.getFirst());
  }

  @DisplayName("Check an exercise from running to paused")
  @Test
  @WithMockAdminUser
  void pauseAnExerciseTest() throws Exception {
    // --PREPARE--
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.PAUSED);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(EXERCISE_URI + "/" + RUNNING_EXERCISE.getId() + "/status")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    List<ExecutableInject> injects = injectHelper.getInjectsToRun();

    // --ASSERT--
    Exercise responseExercise =
        exerciseRepository.findById(JsonPath.read(response, "$.exercise_id")).get();
    assertEquals(
        responseExercise.getCurrentPause().get().truncatedTo(MINUTES),
        Instant.now().truncatedTo(MINUTES));
    assertEquals(
        Arrays.asList(ExerciseStatus.CANCELED.name(), ExerciseStatus.RUNNING.name()),
        JsonPath.read(response, "$.exercise_next_possible_status"));
    assertEquals(0, injects.size());
  }

  @DisplayName("Check an exercise from running to canceled")
  @Test
  @WithMockAdminUser
  void cancelAnExerciseTest() throws Exception {
    // --PREPARE--
    Exercise exercise = exerciseRepository.save(ExerciseFixture.createRunningAttackExercise());
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.CANCELED);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(EXERCISE_URI + "/" + exercise.getId() + "/status")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    Exercise responseExercise =
        exerciseRepository.findById(JsonPath.read(response, "$.exercise_id")).get();
    assertEquals(
        responseExercise.getEnd().get().truncatedTo(MINUTES), Instant.now().truncatedTo(MINUTES));
    assertEquals(
        List.of(ExerciseStatus.SCHEDULED.name()),
        JsonPath.read(response, "$.exercise_next_possible_status"));
    exerciseRepository.delete(exercise);
  }

  @DisplayName("Check an exercise next status")
  @Test
  @WithMockAdminUser
  void checkExerciseNextStatusTest() {
    // --PREPARED--
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.CANCELED);

    // --EXECUTE--
    Exception exception =
        assertThrows(
            ServletException.class,
            () ->
                mvc.perform(
                    put(EXERCISE_URI + "/" + FINISHED_EXERCISE.getId() + "/status")
                        .content(asJsonString(input))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)));

    String expectedMessage = "Exercise cant support moving to status CANCELED";
    String actualMessage = exception.getMessage();

    // --ASSERT--
    assertTrue(actualMessage.contains(expectedMessage));
  }

  @DisplayName("Check an exercise with an inject from finished to scheduled")
  @Test
  @WithMockAdminUser
  void rescheduledExerciseWithInjectTest() throws Exception {
    // --PREPARE--
    ExerciseUpdateStatusInput input = new ExerciseUpdateStatusInput();
    input.setStatus(ExerciseStatus.SCHEDULED);

    String response =
        mvc.perform(
                put(EXERCISE_URI + "/" + FINISHED_EXERCISE.getId() + "/status")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    assertNull(JsonPath.read(response, "$.exercise_start_date"));
    assertNull(JsonPath.read(response, "$.exercise_end_date"));
    assertEquals(Optional.empty(), injectStatusRepository.findByInject(SAVED_INJECT5));
    assertEquals(Optional.empty(), lessonsAnswerRepository.findById(LESSON_ANSWER.getId()));
    assertEquals(
        List.of(ExerciseStatus.RUNNING.name()),
        JsonPath.read(response, "$.exercise_next_possible_status"));
  }
}
