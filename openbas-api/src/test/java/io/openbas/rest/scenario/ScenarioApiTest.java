package io.openbas.rest.scenario;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.scenario.form.ScenarioInformationInput;
import io.openbas.rest.scenario.form.ScenarioInput;
import io.openbas.rest.scenario.form.ScenarioUpdateTagsInput;
import io.openbas.rest.scenario.form.UpdateScenarioInput;
import io.openbas.service.ScenarioService;
import io.openbas.utils.fixtures.ScenarioFixture;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ScenarioApiTest {

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioRepository scenarioRepository;

  @Mock TagRepository tagRepositoryMock;
  @Mock ScenarioService scenarioServiceMock;
  @InjectMocks private ScenarioApi scenarioApi;

  static String SCENARIO_ID;

  void cleanup() {
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
        .perform(
            post(SCENARIO_URI)
                .content(asJsonString(scenarioInput))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is4xxClientError());

    // -- PREPARE --
    String name = "My scenario";
    scenarioInput.setName(name);
    String from = "no-reply@openbas.io";
    scenarioInput.setFrom(from);

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                post(SCENARIO_URI)
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
    cleanup();
  }

  @DisplayName("Retrieve scenarios")
  @Test
  @Order(2)
  @WithMockObserverUser
  void retrieveScenariosTest() throws Exception {
    // -- EXECUTE --
    String response =
        this.mvc
            .perform(get(SCENARIO_URI).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    cleanup();
  }

  @DisplayName("Retrieve scenario")
  @Test
  @Order(3)
  @WithMockObserverUser
  void retrieveScenarioTest() throws Exception {
    // -- EXECUTE --
    String response =
        this.mvc
            .perform(get(SCENARIO_URI + "/" + SCENARIO_ID).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    cleanup();
  }

  @DisplayName("Update scenario")
  @Test
  @Order(4)
  @WithMockPlannerUser
  void updateScenarioTest() throws Exception {
    // -- PREPARE --
    String response =
        this.mvc
            .perform(get(SCENARIO_URI + "/" + SCENARIO_ID).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    ScenarioInput scenarioInput = new ScenarioInput();
    String subtitle = "A subtitle";
    scenarioInput.setName(JsonPath.read(response, "$.scenario_name"));
    scenarioInput.setFrom(JsonPath.read(response, "$.scenario_mail_from"));
    scenarioInput.setSubtitle(subtitle);

    // -- EXECUTE --
    response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID)
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
    cleanup();
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
    String response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID + "/information")
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
    cleanup();
  }

  @DisplayName("Delete scenario")
  @Test
  @Order(6)
  @WithMockPlannerUser
  void deleteScenarioTest() throws Exception {
    // -- EXECUTE 1 ASSERT --
    this.mvc
        .perform(delete(SCENARIO_URI + "/" + SCENARIO_ID))
        .andExpect(status().is2xxSuccessful());
    cleanup();
  }

  @DisplayName("Update with apply rule")
  @Test
  public void testUpdateScenario_WITH_apply_rule_true() {
    io.openbas.database.model.Tag tag1 = TagFixture.getTag("Tag1");
    io.openbas.database.model.Tag tag2 = TagFixture.getTag("Tag2");
    io.openbas.database.model.Tag tag3 = TagFixture.getTag("Tag3");

    Scenario scenario = ScenarioFixture.getScenarioWithInjects();
    scenario.setTags(Set.of(tag2, tag3, tag1));
    scenario.setId("test");
    UpdateScenarioInput input = new UpdateScenarioInput();
    input.setDescription("test");
    input.setApplyTagRule(true);
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));

    Scenario expected = ScenarioFixture.getScenarioWithInjects();
    scenario.setId("test");
    expected.setDescription("test");
    expected.setTags(Set.of(tag1, tag2));

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(scenario).when(scenarioServiceMock).scenario(scenario.getId());

    scenarioApi.updateScenario(scenario.getId(), input);

    verify(scenarioServiceMock).updateScenarioAndApplyRule(expected, Set.of(tag2, tag3, tag1));
  }

  @DisplayName("Update without apply rule")
  @Test
  public void testUpdateScenario_WITH_apply_rule_false() throws Exception {
    io.openbas.database.model.Tag tag1 = TagFixture.getTag("Tag1");
    io.openbas.database.model.Tag tag2 = TagFixture.getTag("Tag2");
    io.openbas.database.model.Tag tag3 = TagFixture.getTag("Tag3");

    Scenario scenario = ScenarioFixture.getScenarioWithInjects();
    scenario.setTags(Set.of(tag2, tag3, tag1));
    scenario.setId("test");
    UpdateScenarioInput input = new UpdateScenarioInput();
    input.setDescription("test");
    input.setApplyTagRule(true);
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));

    Scenario expected = ScenarioFixture.getScenarioWithInjects();
    expected.setId("test");
    expected.setDescription("test");
    expected.setTags(Set.of(tag1, tag2));

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(scenario).when(scenarioServiceMock).scenario(scenario.getId());

    scenarioApi.updateScenario(scenario.getId(), input);

    verify(scenarioServiceMock).updateScenario(expected);
  }

  @DisplayName("Update tags without apply rule")
  @Test
  public void testUpdateScenarioTags_WITH_apply_rule_false() {
    io.openbas.database.model.Tag tag1 = TagFixture.getTag("Tag1");
    io.openbas.database.model.Tag tag2 = TagFixture.getTag("Tag2");
    io.openbas.database.model.Tag tag3 = TagFixture.getTag("Tag3");

    Scenario scenario = ScenarioFixture.getScenarioWithInjects();
    scenario.setTags(Set.of(tag2, tag3, tag1));
    scenario.setId("test");

    ScenarioUpdateTagsInput input = new ScenarioUpdateTagsInput();
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));

    Scenario expected = ScenarioFixture.getScenarioWithInjects();
    expected.setId("test");
    expected.setTags(Set.of(tag1, tag2));

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(scenario).when(scenarioServiceMock).scenario(scenario.getId());

    scenarioApi.updateScenarioTags(scenario.getId(), input);

    verify(scenarioServiceMock).updateScenario(expected);
  }

  @DisplayName("Update tags with apply rule")
  @Test
  public void testUpdateScenarioTags_WITH_apply_rule_true() {
    io.openbas.database.model.Tag tag1 = TagFixture.getTag("Tag1");
    io.openbas.database.model.Tag tag2 = TagFixture.getTag("Tag2");
    Tag tag3 = TagFixture.getTag("Tag3");

    Scenario scenario = ScenarioFixture.getScenarioWithInjects();
    scenario.setTags(Set.of(tag2, tag3, tag1));
    scenario.setId("test");
    ScenarioUpdateTagsInput input = new ScenarioUpdateTagsInput();
    input.setTagIds(List.of(tag1.getId(), tag2.getId()));
    input.setApplyTagRule(true);

    Scenario expected = ScenarioFixture.getScenarioWithInjects();
    expected.setId("test");
    expected.setTags(Set.of(tag1, tag2));

    doReturn(List.of(tag1, tag2))
        .when(tagRepositoryMock)
        .findAllById(List.of(tag1.getId(), tag2.getId()));
    doReturn(scenario).when(scenarioServiceMock).scenario(scenario.getId());

    scenarioApi.updateScenarioTags(scenario.getId(), input);

    verify(scenarioServiceMock).updateScenarioAndApplyRule(expected, Set.of(tag2, tag3, tag1));
  }
}
