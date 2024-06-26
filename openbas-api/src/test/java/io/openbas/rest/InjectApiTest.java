package io.openbas.rest;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.inject.form.InjectInput;
import io.openbas.service.ScenarioService;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
class InjectApiTest {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private ScenarioService scenarioService;
  @Autowired
  private ScenarioRepository scenarioRepository;
  @Autowired
  private InjectRepository injectRepository;
  @Autowired
  private InjectorContractRepository injectorContractRepository;

  static String SCENARIO_ID;
  static String INJECT_ID;

  @AfterAll
  void afterAll() {
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.injectRepository.deleteById(INJECT_ID);
  }

  // -- SCENARIOS --

  @DisplayName("Add an inject for scenario")
  @Test
  @Order(1)
  @WithMockPlannerUser
  void addInjectForScenarioTest() throws Exception {
    // -- PREPARE --
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    InjectInput input = new InjectInput();
    input.setTitle("Test inject");
    input.setInjectorContract(EMAIL_DEFAULT);
    input.setDependsDuration(0L);

    // -- EXECUTE --
    String response = this.mvc
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
    response = this.mvc
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
    String response = this.mvc
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
    String response = this.mvc
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

  @DisplayName("Add an inject for scenario")
  @Test
  @Order(4)
  @WithMockPlannerUser
  void updateInjectForScenarioTest() throws Exception {
    // -- PREPARE --
    Inject inject = this.injectRepository.findById(INJECT_ID).orElseThrow();
    InjectInput input = new InjectInput();
    input.setId(INJECT_ID);
    String injectTitle = "A new title";
    input.setTitle(injectTitle);
    input.setInjectorContract(inject.getInjectorContract().getId());
    input.setDependsDuration(inject.getDependsDuration());

    // -- EXECUTE --
    String response = this.mvc
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
    this.mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO_ID + "/injects/" + INJECT_ID))
        .andExpect(status().is2xxSuccessful());
  }

}
