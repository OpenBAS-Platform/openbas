package io.openbas.rest;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ExerciseRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.ScenarioRepository;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
class InjectApiTest extends IntegrationTest {

    static String EXERCISE_ID;
    static String SCENARIO_ID;
    static String INJECT_ID;

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
    }

    @AfterAll
    void afterAll() {
        this.scenarioRepository.deleteById(SCENARIO_ID);
        this.exerciseRepository.deleteById(EXERCISE_ID);
        this.injectRepository.deleteById(INJECT_ID);
    }

    // -- SCENARIOS --
    @Nested
    @DisplayName("Scenarios")
    class Scenarios {

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
            INJECT_ID = JsonPath.read(response, "$.inject_id");
            response = mvc
                    .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();
            assertEquals(INJECT_ID, JsonPath.read(response, "$.scenario_injects[0]"));
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
            assertEquals(INJECT_ID, JsonPath.read(response, "$[0].inject_id"));
        }

        @DisplayName("Retrieve inject for scenario")
        @Test
        @Order(3)
        @WithMockObserverUser
        void retrieveInjectForScenarioTest() throws Exception {
            // -- EXECUTE --
            String response = mvc
                    .perform(get(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/" + INJECT_ID)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // -- ASSERT --
            assertNotNull(response);
            assertEquals(INJECT_ID, JsonPath.read(response, "$.inject_id"));
        }

        @DisplayName("Update inject for scenario")
        @Test
        @Order(4)
        @WithMockPlannerUser
        void updateInjectForScenarioTest() throws Exception {
            // -- PREPARE --
            Inject inject = injectRepository.findById(INJECT_ID).orElseThrow();
            InjectInput input = new InjectInput();
            String injectTitle = "A new title";
            input.setTitle(injectTitle);
            input.setInjectorContract(inject.getInjectorContract().getId());
            input.setDependsDuration(inject.getDependsDuration());

            // -- EXECUTE --
            String response = mvc
                    .perform(put(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/" + INJECT_ID)
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
            mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/" + INJECT_ID))
                    .andExpect(status().is2xxSuccessful());
        }

        // BULK DELETE
        @DisplayName("Delete list of injects for scenario")
        @Test
        @Order(6)
        @WithMockPlannerUser
        void deleteInjectsForScenarioTest() throws Exception {
            // -- EXECUTE --
            mvc.perform(post(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/delete")
                            .content(asJsonString(List.of('1', '2')))
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful());
        }
    }

    // -- EXERCISES --
    @Nested
    @DisplayName("Exercises")
    class Exercises {

        @DisplayName("Add an inject for exercise")
        @Test
        @Order(7)
        @WithMockPlannerUser
        void addInjectForExerciseTest() throws Exception {
            InjectInput input = new InjectInput();
            input.setTitle("Test inject");
            input.setInjectorContract(EMAIL_DEFAULT);
            input.setDependsDuration(0L);

            // -- EXECUTE --
            String response = mvc
                    .perform(post(EXERCISE_URI + "/" + EXERCISE_ID + "/injects")
                            .content(asJsonString(input))
                            .contentType(MediaType.APPLICATION_JSON)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // -- ASSERT --
            assertNotNull(response);
            INJECT_ID = JsonPath.read(response, "$.inject_id");
            response = mvc
                    .perform(get(EXERCISE_URI + "/" + EXERCISE_ID)
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();
            assertEquals(INJECT_ID, JsonPath.read(response, "$.exercise_injects[0]"));
        }

        // -- BULK DELETE --
        @DisplayName("Delete list of inject for exercise")
        @Test
        @Order(8)
        @WithMockPlannerUser
        void deleteInjectsForExerciseTest() throws Exception {
            // -- EXECUTE 1 ASSERT --
            mvc.perform(post(EXERCISE_URI + "/" + EXERCISE_ID + "/injects/delete")
                            .content(asJsonString(List.of('1', '2')))
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful());
        }
    }
}
