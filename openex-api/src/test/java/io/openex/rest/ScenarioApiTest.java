package io.openex.rest;

import com.jayway.jsonpath.JsonPath;
import io.openex.rest.scenario.form.ScenarioInput;
import io.openex.rest.utils.WithMockObserverUser;
import io.openex.rest.utils.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static io.openex.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openex.rest.utils.JsonUtils.asJsonString;
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

  static String SCENARIO_ID;

  @DisplayName("Create scenario succeed")
  @Test
  @Order(1)
  @WithMockUser
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
  @WithMockUser
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

  @DisplayName("Delete scenario")
  @Test
  @Order(4)
  @WithMockPlannerUser
  void deleteScenarioTest() throws Exception {
    // -- EXECUTE --
    this.mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO_ID));

    // -- ASSERT --
    this.mvc
        .perform(get(SCENARIO_URI + "/" + SCENARIO_ID)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is4xxClientError());
  }

}
