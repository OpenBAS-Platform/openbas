package io.openbas.rest;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exercise.ExerciseService;
import io.openbas.rest.inject.form.InjectInput;
import io.openbas.service.ScenarioService;
import io.openbas.utils.fixtures.InjectExpectationFixture;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static io.openbas.database.model.ExerciseStatus.RUNNING;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.rest.exercise.ExerciseApi.EXERCISE_URI;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
class InjectApiTest extends IntegrationTest {

  static Exercise EXERCISE;
  static Scenario SCENARIO;
  static Document DOCUMENT1;
  static Document DOCUMENT2;
  static Team TEAM;
  static String SCENARIO_INJECT_ID;

  @Autowired
  private MockMvc mvc;
  @Autowired
  private ScenarioService scenarioService;
  @Autowired
  private ExerciseService exerciseService;
  @Autowired
  private ExerciseRepository exerciseRepository;
  @Autowired
  private ScenarioRepository scenarioRepository;
  @Autowired
  private InjectRepository injectRepository;
  @Autowired
  private DocumentRepository documentRepository;
  @Autowired
  private CommunicationRepository communicationRepository;
  @Autowired
  private InjectExpectationRepository injectExpectationRepository;
  @Autowired
  private TeamRepository teamRepository;
  @Autowired
  private InjectorContractRepository injectorContractRepository;

  @BeforeAll
  void beforeAll() {
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    scenario.setFrom("test@test.com");
    scenario.setReplyTos(List.of("test@test.com"));
    SCENARIO = scenarioService.createScenario(scenario);

    Exercise exercise = new Exercise();
    exercise.setName("Exercise name");
    exercise.setStart(Instant.now());
    exercise.setFrom("test@test.com");
    exercise.setReplyTos(List.of("test@test.com"));
    exercise.setStatus(RUNNING);
    EXERCISE = exerciseService.createExercise(exercise);

    Document document1 = new Document();
    document1.setName("Document 1");
    document1.setType("image");
    Document document2 = new Document();
    document2.setName("Document 2");
    document2.setType("pdf");
    DOCUMENT1 = documentRepository.save(document1);
    DOCUMENT2 = documentRepository.save(document2);

    Team team = new Team();
    team.setName("team");
    TEAM = teamRepository.save(team);
  }

  @AfterAll
  void afterAll() {
    this.scenarioRepository.delete(SCENARIO);
    this.exerciseRepository.delete(EXERCISE);
    this.documentRepository.deleteAll(List.of(DOCUMENT1, DOCUMENT2));
    this.teamRepository.delete(TEAM);
  }

  // -- SCENARIOS --

  @DisplayName("Add an inject for scenario")
  @Test
  @Order(1)
  @WithMockPlannerUser
  void addInjectForScenarioTest() throws Exception {
    // -- PREPARE --
    InjectInput input = new InjectInput();
    input.setTitle("Test inject");
    input.setInjectorContract(EMAIL_DEFAULT);
    input.setDependsDuration(0L);

    // -- EXECUTE --
    String response = mvc
        .perform(post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects")
            .content(asJsonString(input))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    SCENARIO_INJECT_ID = JsonPath.read(response, "$.inject_id");
    response = mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO.getId())
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    assertEquals(SCENARIO_INJECT_ID, JsonPath.read(response, "$.scenario_injects[0]"));
  }

  @DisplayName("Retrieve injects for scenario")
  @Test
  @Order(2)
  @WithMockObserverUser
  void retrieveInjectsForScenarioTest() throws Exception {
    // -- EXECUTE --
    String response = mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects")
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(SCENARIO_INJECT_ID, JsonPath.read(response, "$[0].inject_id"));
  }

  @DisplayName("Retrieve inject for scenario")
  @Test
  @Order(3)
  @WithMockObserverUser
  void retrieveInjectForScenarioTest() throws Exception {
    // -- EXECUTE --
    String response = mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/" + SCENARIO_INJECT_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(SCENARIO_INJECT_ID, JsonPath.read(response, "$.inject_id"));
  }

  @DisplayName("Update inject for scenario")
  @Test
  @Order(4)
  @WithMockPlannerUser
  void updateInjectForScenarioTest() throws Exception {
    // -- PREPARE --
    Inject inject = injectRepository.findById(SCENARIO_INJECT_ID).orElseThrow();
    InjectInput input = new InjectInput();
    String injectTitle = "A new title";
    input.setTitle(injectTitle);
    input.setInjectorContract(inject.getInjectorContract().map(InjectorContract::getId).orElse(null));
    input.setDependsDuration(inject.getDependsDuration());

    // -- EXECUTE --
    String response = mvc
        .perform(put(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/" + SCENARIO_INJECT_ID)
            .content(asJsonString(input))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(injectTitle, JsonPath.read(response, "$.inject_title"));
  }

  @DisplayName("Delete inject for scenario")
  @Test
  @Order(5)
  @WithMockPlannerUser
  void deleteInjectForScenarioTest() throws Exception {
    // -- EXECUTE 1 ASSERT --
    mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/" + SCENARIO_INJECT_ID))
        .andExpect(status().is2xxSuccessful());

    assertFalse(injectRepository.existsById(SCENARIO_INJECT_ID));
  }

  // BULK DELETE
  @DisplayName("Delete list of injects for scenario")
  @Test
  @Order(6)
  @WithMockPlannerUser
  void deleteInjectsForScenarioTest() throws Exception {
    // -- PREPARE --
    Inject injectForScenario1 = new Inject();
    injectForScenario1.setTitle("Inject for scenario 1");
    injectForScenario1.setCreatedAt(Instant.now());
    injectForScenario1.setUpdatedAt(Instant.now());
    injectForScenario1.setDependsDuration(5L);
    injectForScenario1.setInjectorContract(injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
    injectForScenario1.setScenario(SCENARIO);
    Inject createdInject = injectRepository.save(injectForScenario1);

    InjectDocument injectDocument4 = new InjectDocument();
    injectDocument4.setInject(createdInject);
    injectDocument4.setDocument(DOCUMENT2);
    createdInject.setDocuments(List.of(injectDocument4));

    injectExpectationRepository.save(InjectExpectationFixture.createArticleInjectExpectation(TEAM, createdInject));

    // -- ASSERT --
    assertTrue(injectRepository.existsById(createdInject.getId()), "The inject should exist from the database");
    assertFalse(injectRepository.findByScenarioId(SCENARIO.getId()).isEmpty(),
        "There should be injects for the scenario in the database");
    assertFalse(injectExpectationRepository.findAllByInjectAndTeam(createdInject.getId(), TEAM.getId()).isEmpty(),
        "There should be expectations for the scenario in the database");

    // -- EXECUTE --
    mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects")
            .content(asJsonString(List.of(createdInject.getId())))
            .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    // -- ASSERT --
    assertFalse(injectRepository.existsById(createdInject.getId()), "The inject should be deleted from the database");
    assertTrue(scenarioRepository.existsById(SCENARIO.getId()), "The scenario should still exist in the database");
    assertTrue(injectRepository.findByScenarioId(SCENARIO.getId()).isEmpty(),
        "There should be no injects for the scenario in the database");
    assertTrue(documentRepository.existsById(DOCUMENT2.getId()), "The document should still exist in the database");
    assertTrue(injectExpectationRepository.findAllByInjectAndTeam(createdInject.getId(), TEAM.getId()).isEmpty(),
        "There should be no expectations related to the inject in the database");
  }

  // -- EXERCISES --

  // -- BULK DELETE --

  @DisplayName("Delete list of inject for exercise")
  @Test
  @Order(8)
  @WithMockPlannerUser
  void deleteInjectsForExerciseTest() throws Exception {
    // -- PREPARE --
    Inject injectForExercise1 = new Inject();
    injectForExercise1.setTitle("Inject for exercise 1");
    injectForExercise1.setCreatedAt(Instant.now());
    injectForExercise1.setUpdatedAt(Instant.now());
    injectForExercise1.setDependsDuration(1L);
    injectForExercise1.setExercise(EXERCISE);

    Inject injectForExercise2 = new Inject();
    injectForExercise2.setTitle("Inject for exercise 2");
    injectForExercise2.setCreatedAt(Instant.now());
    injectForExercise2.setUpdatedAt(Instant.now());
    injectForExercise2.setDependsDuration(2L);
    injectForExercise2.setExercise(EXERCISE);

    Inject createdInject1 = injectRepository.save(injectForExercise1);
    Inject createdInject2 = injectRepository.save(injectForExercise2);

    InjectDocument injectDocument1 = new InjectDocument();
    injectDocument1.setInject(createdInject1);
    injectDocument1.setDocument(DOCUMENT1);

    InjectDocument injectDocument2 = new InjectDocument();
    injectDocument2.setInject(createdInject1);
    injectDocument2.setDocument(DOCUMENT2);

    InjectDocument injectDocument3 = new InjectDocument();
    injectDocument3.setInject(createdInject2);
    injectDocument3.setDocument(DOCUMENT1);

    createdInject1.setDocuments(List.of(injectDocument1, injectDocument2));
    createdInject2.setDocuments(List.of(injectDocument3));

    injectRepository.save(createdInject1);
    injectRepository.save(createdInject2);

    Communication communication = new Communication();
    communication.setInject(createdInject1);
    communication.setIdentifier("messageId");
    communication.setFrom("test@test.com");
    communication.setTo("test@test.com");
    communication.setSentAt(Instant.now());
    communication.setReceivedAt(Instant.now());
    Communication createdCommunication = communicationRepository.save(communication);

    injectExpectationRepository.save(InjectExpectationFixture.createPreventionInjectExpectation(TEAM, createdInject1));
    injectExpectationRepository.save(InjectExpectationFixture.createDetectionInjectExpectation(TEAM, createdInject1));
    injectExpectationRepository.save(InjectExpectationFixture.createManualInjectExpectation(TEAM, createdInject2));

    // -- ASSERT --
    assertTrue(injectRepository.existsById(createdInject1.getId()), "The inject should exist from the database");
    assertFalse(injectRepository.findByExerciseId(EXERCISE.getId()).isEmpty(),
        "There should be injects for the exercise in the database");
    assertEquals(1, communicationRepository.findByInjectId(createdInject1.getId()).size());
    assertEquals(2, injectExpectationRepository.findAllByInjectAndTeam(createdInject1.getId(), TEAM.getId()).size());
    assertEquals(1, injectExpectationRepository.findAllByInjectAndTeam(createdInject2.getId(), TEAM.getId()).size());

    // -- EXECUTE --
    mvc.perform(delete(EXERCISE_URI + "/" + EXERCISE.getId() + "/injects")
            .content(asJsonString(List.of(createdInject1.getId(), createdInject2.getId())))
            .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    // -- ASSERT --
    assertFalse(injectRepository.existsById(createdInject1.getId()), "The inject should be deleted from the database");
    assertFalse(injectRepository.existsById(createdInject2.getId()), "The inject should be deleted from the database");
    assertTrue(exerciseRepository.existsById(EXERCISE.getId()), "The exercise should still exist in the database");
    assertTrue(injectRepository.findByExerciseId(EXERCISE.getId()).isEmpty(),
        "There should be no injects for the exercise in the database");
    assertTrue(documentRepository.existsById(DOCUMENT1.getId()), "The document should still exist in the database");
    assertFalse(communicationRepository.existsById(createdCommunication.getId()),
        "The communication should be deleted from the database");
    assertTrue(injectExpectationRepository.findAllByInjectAndTeam(createdInject1.getId(), TEAM.getId()).isEmpty(),
        "There should be no expectations related to the inject in the database");
  }
}

