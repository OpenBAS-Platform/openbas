package io.openbas.rest.scenario;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
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
import io.openbas.database.model.Asset;
import io.openbas.database.model.Inject;
import io.openbas.database.model.Scenario;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.*;
import io.openbas.rest.scenario.form.ScenarioInformationInput;
import io.openbas.rest.scenario.form.ScenarioInput;
import io.openbas.rest.scenario.form.ScenarioUpdateTagsInput;
import io.openbas.rest.scenario.form.UpdateScenarioInput;
import io.openbas.service.ScenarioService;
import io.openbas.utils.fixtures.InjectFixture;
import io.openbas.utils.fixtures.InjectorContractFixture;
import io.openbas.utils.fixtures.ScenarioFixture;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.mockUser.WithMockObserverUser;
import io.openbas.utils.mockUser.WithMockPlannerUser;

import java.util.HashSet;
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
  public static final String EMAIL_DEFAULT = "138ad8f8-32f8-4a22-8114-aaa12322bd09";

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private TagRepository tagRepository;
  @Autowired private AssetRepository assetRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;

  @Mock TagRepository tagRepositoryMock;
  @Mock ScenarioService scenarioServiceMock;
  @InjectMocks private ScenarioApi scenarioApi;

  static String SCENARIO_ID;
    @Autowired
    private InjectRepository injectRepository;

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
  public void testUpdateScenario_WITH_apply_rule_false() throws Exception {
    String tag1 = "tag1";
    String tag2 = "tag2";
    Tag tag3 = createTag("tag3");
    Scenario scenario = createScenario("testScenario", List.of(tag1, tag2));

    UpdateScenarioInput updateScenarioInput = new UpdateScenarioInput();
    updateScenarioInput.setApplyTagRule(false);
    updateScenarioInput.setTagIds(List.of(tag3.getId()));


    this.mvc
            .perform(
                    put(SCENARIO_URI + "/" + scenario.getId())
                            .content(asJsonString(updateScenarioInput))
                            .contentType(MediaType.APPLICATION_JSON)
                            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();


    Scenario updatedScenario = scenarioRepository.findById(scenario.getId()).orElseThrow();
    assertEquals(updatedScenario.getTags().size(), 1);
    assertEquals(new HashSet<>(updatedScenario.getInjects().getFirst().getAssets()),
            new HashSet<>(scenario.getInjects().getFirst().getAssets()));
  }


  private Scenario createScenario(String scenarioName, List<String> tagNames) {
    Scenario scenario = new Scenario();
    tagNames.forEach(tagName -> scenario.getTags().add(createTag(tagName)));
    scenarioRepository.save(scenario);
    createInject(scenario.getId());
    return scenarioRepository.findById(scenario.getId()).orElseThrow();
  }

  private Inject createInject(String scenarioId) {
    Inject inject =  InjectFixture.getInjectForEmailContract(injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
    inject.setScenario(scenarioRepository.findById(scenarioId).orElseThrow());
    return injectRepository.save(inject);
  }

  private Tag createTag(String tagName) {
    Tag tag = new Tag();
    tag.setName(tagName + System.currentTimeMillis());
    tag.setColor("#0000");
    return tagRepository.save(tag);
  }

  private Asset createAsset(String assetName) {
    Asset asset = new Asset();
    asset.setName(assetName);
    return assetRepository.save(asset);
  }
}
