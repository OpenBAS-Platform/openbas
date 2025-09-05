package io.openbas.rest;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Variable;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.VariableRepository;
import io.openbas.service.ScenarioService;
import io.openbas.utils.mockUser.WithMockAdminUser;
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
public class VariableApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioService scenarioService;
  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private VariableRepository variableRepository;

  static String VARIABLE_ID;
  static String SCENARIO_ID;

  @AfterAll
  void afterAll() {
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.variableRepository.deleteById(VARIABLE_ID);
  }

  // -- SCENARIOS --

  @DisplayName("Create variable for scenario succeed")
  @Test
  @Order(1)
  @WithMockAdminUser
  void createVariableForScenarioTest() throws Exception {
    // -- PREPARE --
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();
    Variable variable = new Variable();

    // -- EXECUTE & ASSERT --
    this.mvc
        .perform(
            post(SCENARIO_URI + "/" + SCENARIO_ID + "/variables")
                .content(asJsonString(variable))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is4xxClientError());

    // -- PREPARE --
    String variableKey = "key";
    variable.setKey(variableKey);
    variable.setScenario(scenario);

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                post(SCENARIO_URI + "/" + SCENARIO_ID + "/variables")
                    .content(asJsonString(variable))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.variable_key").value(variableKey))
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    VARIABLE_ID = JsonPath.read(response, "$.variable_id");
  }

  @DisplayName("Retrieve variables for scenario")
  @Test
  @Order(2)
  @WithMockAdminUser
  void retrieveVariableForScenarioTest() throws Exception {
    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                get(SCENARIO_URI + "/" + SCENARIO_ID + "/variables")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Update variable for scenario")
  @Test
  @Order(3)
  @WithMockAdminUser
  void updateVariableForScenarioTest() throws Exception {
    // -- PREPARE --
    String response =
        this.mvc
            .perform(
                get(SCENARIO_URI + "/" + SCENARIO_ID + "/variables")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    Variable variable = new Variable();
    String variableValue = "variable-value";
    variable.setKey(JsonPath.read(response, "$[0].variable_key"));
    variable.setValue("variable-value");

    // -- EXECUTE --
    response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID + "/variables/" + VARIABLE_ID)
                    .content(asJsonString(variable))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(variableValue, JsonPath.read(response, "$.variable_value"));
  }

  @DisplayName("Delete variable for scenario")
  @Test
  @Order(4)
  @WithMockAdminUser
  void deleteVariableForScenarioTest() throws Exception {
    // -- EXECUTE 1 ASSERT --
    this.mvc
        .perform(delete(SCENARIO_URI + "/" + SCENARIO_ID + "/variables/" + VARIABLE_ID))
        .andExpect(status().is2xxSuccessful());
  }
}
