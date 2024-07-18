package io.openbas.rest;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.exercise.ExerciseService;
import io.openbas.rest.inject.form.InjectInput;
import io.openbas.service.ScenarioService;
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

    static String EXERCISE_ID;
    static String SCENARIO_ID;
    static String SCENARIO_INJECT_ID;
    static String SCENARIO_INJECT_ID_1;
    static String EXERCISE_INJECT_ID_1;
    static String EXERCISE_INJECT_ID_2;
    static String DOCUMENT_1;
    static String DOCUMENT_2;

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
    private InjectDocumentRepository injectDocumentRepository;

    @BeforeAll
    void beforeAll() {
        Scenario scenario = new Scenario();
        scenario.setName("Scenario name");
        scenario.setFrom("test@test.com");
        scenario.setReplyTos(List.of("test@test.com"));
        Scenario scenarioCreated = scenarioService.createScenario(scenario);
        SCENARIO_ID = scenarioCreated.getId();

        Exercise exercise = new Exercise();
        exercise.setName("Exercise name");
        exercise.setStart(Instant.now());
        exercise.setFrom("test@test.com");
        exercise.setReplyTos(List.of("test@test.com"));
        exercise.setStatus(RUNNING);
        Exercise exerciseCreated = exerciseService.createExercise(exercise);
        EXERCISE_ID = exerciseCreated.getId();

        // CREATE INJECTS

        Document document1 = new Document();
        document1.setName("Document 1");
        document1.setType("image");
        Document document2 = new Document();
        document2.setName("Document 2");
        document2.setType("pdf");
        Document createdDocument1 = documentRepository.save(document1);
        DOCUMENT_1 = createdDocument1.getId();
        Document createdDocument2 = documentRepository.save(document2);
        DOCUMENT_2 = createdDocument2.getId();

        Inject injectForExercise1 = new Inject();
        injectForExercise1.setTitle("Inject for exercise 1");
        injectForExercise1.setCreatedAt(Instant.now());
        injectForExercise1.setUpdatedAt(Instant.now());
        injectForExercise1.setDependsDuration(1L);
        injectForExercise1.setExercise(exercise);

        Inject injectForExercise2 = new Inject();
        injectForExercise2.setTitle("Inject for exercise 2");
        injectForExercise2.setCreatedAt(Instant.now());
        injectForExercise2.setUpdatedAt(Instant.now());
        injectForExercise2.setDependsDuration(2L);
        injectForExercise2.setExercise(exercise);

        Inject injectForScenario1 = new Inject();
        injectForScenario1.setTitle("Inject for scenario 1");
        injectForScenario1.setCreatedAt(Instant.now());
        injectForScenario1.setUpdatedAt(Instant.now());
        injectForScenario1.setDependsDuration(2L);
        injectForScenario1.setExercise(exercise);

        Inject createdInject1 = injectRepository.save(injectForExercise1);
        EXERCISE_INJECT_ID_1 = createdInject1.getId();
        Inject createdInject2 = injectRepository.save(injectForExercise2);
        EXERCISE_INJECT_ID_2 = createdInject2.getId();
        Inject createdInject3 = injectRepository.save(injectForScenario1);
        SCENARIO_INJECT_ID_1 = createdInject3.getId();

        InjectDocument injectDocument1 = new InjectDocument();
        injectDocument1.setInject(createdInject1);
        injectDocument1.setDocument(createdDocument1);

        InjectDocument injectDocument2 = new InjectDocument();
        injectDocument2.setInject(createdInject2);
        injectDocument2.setDocument(createdDocument1);

        InjectDocument injectDocument3 = new InjectDocument();
        injectDocument3.setInject(createdInject1);
        injectDocument3.setDocument(createdDocument2);

        createdInject1.setDocuments(List.of(injectDocument1, injectDocument3));
        createdInject2.setDocuments(List.of(injectDocument2));
    }

    @AfterAll
    void afterAll() {
        this.scenarioRepository.deleteById(SCENARIO_ID);
        this.exerciseRepository.deleteById(EXERCISE_ID);
        this.injectRepository.deleteById(EXERCISE_INJECT_ID_1);
        this.injectRepository.deleteById(EXERCISE_INJECT_ID_2);
        this.injectRepository.deleteById(SCENARIO_INJECT_ID);
        this.documentRepository.deleteById(DOCUMENT_1);
        this.documentRepository.deleteById(DOCUMENT_2);
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
                .perform(post(SCENARIO_URI + "/" + SCENARIO_ID + "/injects")
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
                .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
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
                .perform(get(SCENARIO_URI + "/" + SCENARIO_ID + "/injects")
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
                .perform(get(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/" + SCENARIO_INJECT_ID)
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
        input.setInjectorContract(inject.getInjectorContract().getId());
        input.setDependsDuration(inject.getDependsDuration());

        // -- EXECUTE --
        String response = mvc
                .perform(put(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/" + SCENARIO_INJECT_ID)
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
        mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/" + SCENARIO_INJECT_ID))
                .andExpect(status().is2xxSuccessful());

        boolean injectExists = injectRepository.existsById(SCENARIO_INJECT_ID);
        assertFalse(injectExists, "Inject should be deleted from the database");
    }

    // BULK DELETE
    @DisplayName("Delete list of injects for scenario")
    @Test
    @Order(6)
    @WithMockPlannerUser
    void deleteInjectsForScenarioTest() throws Exception {
        // -- EXECUTE --
        mvc.perform(post(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/delete")
                        .content(asJsonString(List.of(SCENARIO_INJECT_ID_1)))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful());

        boolean injectExists = injectRepository.existsById(SCENARIO_INJECT_ID_1);
        assertFalse(injectExists, "Inject should be deleted from the database");
    }

    // -- EXERCISES --

    // -- BULK DELETE --

    @DisplayName("Delete list of inject for exercise")
    @Test
    @Order(8)
    @WithMockPlannerUser
    void deleteInjectsForExerciseTest() throws Exception {
        // -- EXECUTE 1 ASSERT --
        mvc.perform(post(EXERCISE_URI + "/" + EXERCISE_ID + "/injects/delete")
                        .content(asJsonString(List.of(EXERCISE_INJECT_ID_1, EXERCISE_INJECT_ID_2)))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful());

        boolean injectExists = injectRepository.existsById(EXERCISE_INJECT_ID_1);
        assertFalse(injectExists, "Inject should be deleted from the database");

        boolean documentExists = documentRepository.existsById(DOCUMENT_1);
        assertTrue(documentExists, "Document should be still exists in the database");

    }
}

