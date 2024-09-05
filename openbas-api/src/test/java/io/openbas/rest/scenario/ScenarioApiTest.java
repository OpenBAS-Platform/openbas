package io.openbas.rest.scenario;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.scenario.form.ScenarioInformationInput;
import io.openbas.rest.scenario.form.ScenarioInput;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class ScenarioApiTest {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private ScenarioRepository scenarioRepository;

  static String SCENARIO_ID;

  @AfterAll
  void afterAll() {
    this.scenarioRepository.deleteById(SCENARIO_ID);
  }

  @DisplayName("Create scenario succeed")
  @Test
  @Order(1)
  @WithMockPlannerUser
  void createScenarioTest() throws Exception {
    // -- PREPARE --
    ScenarioInput scenarioInput = new ScenarioInput();

    // -- EXECUTE & ASSERT --
    this.mvc
        .perform(post(SCENARIO_URI)
            .content(asJsonString(scenarioInput))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is4xxClientError());

    // -- PREPARE --
    String name = "My scenario";
    scenarioInput.setName(name);

    // -- EXECUTE --
    String response = this.mvc
        .perform(post(SCENARIO_URI)
            .content(asJsonString(scenarioInput))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.scenario_name").value(name))
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    SCENARIO_ID = JsonPath.read(response, "$.scenario_id");
  }

  @DisplayName("Retrieve scenarios")
  @Test
  @Order(2)
  @WithMockObserverUser
  void retrieveScenariosTest() throws Exception {
    // -- EXECUTE --
    String response = this.mvc
        .perform(get(SCENARIO_URI)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Retrieve scenario")
  @Test
  @Order(3)
  @WithMockObserverUser
  void retrieveScenarioTest() throws Exception {
    // -- EXECUTE --
    String response = this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Update scenario")
  @Test
  @Order(4)
  @WithMockPlannerUser
  void updateScenarioTest() throws Exception {
    // -- PREPARE --
    String response = this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    ScenarioInput scenarioInput = new ScenarioInput();
    String subtitle = "A subtitle";
    scenarioInput.setName(JsonPath.read(response, "$.scenario_name"));
    scenarioInput.setSubtitle(subtitle);

    // -- EXECUTE --
    response = this.mvc
        .perform(put(SCENARIO_URI + "/" + SCENARIO_ID)
            .content(asJsonString(scenarioInput))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(subtitle, JsonPath.read(response, "$.scenario_subtitle"));
  }

  @DisplayName("Update scenario information")
  @Test
  @Order(5)
  @WithMockPlannerUser
  void updateScenarioInformationTest() throws Exception {
    // -- PREPARE --
    ScenarioInformationInput scenarioInformationInput = new ScenarioInformationInput();
    String header = "NEW HEADER";
    scenarioInformationInput.setFrom("no-reply@filigran.io");
    scenarioInformationInput.setHeader(header);

    // -- EXECUTE --
    String response = this.mvc
        .perform(put(SCENARIO_URI + "/" + SCENARIO_ID + "/information")
            .content(asJsonString(scenarioInformationInput))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(header, JsonPath.read(response, "$.scenario_message_header"));
  }

  @DisplayName("Delete scenario")
  @Test
  @Order(6)
  @WithMockPlannerUser
  void deleteScenarioTest() throws Exception {
    // -- EXECUTE 1 ASSERT --
    this.mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO_ID))
        .andExpect(status().is2xxSuccessful());
  }

}
