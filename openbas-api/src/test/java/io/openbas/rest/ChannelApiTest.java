package io.openbas.rest;

import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Channel;
import io.openbas.database.model.Scenario;
import io.openbas.database.repository.ArticleRepository;
import io.openbas.database.repository.ChannelRepository;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.rest.channel.form.ArticleCreateInput;
import io.openbas.rest.channel.form.ArticleUpdateInput;
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
class ChannelApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioService scenarioService;
  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private ChannelRepository channelRepository;
  @Autowired private ArticleRepository articleRepository;

  static String SCENARIO_ID;
  static String CHANNEL_ID;
  static String ARTICLE_ID;

  @AfterAll
  void afterAll() {
    this.scenarioRepository.deleteById(SCENARIO_ID);
    this.channelRepository.deleteById(CHANNEL_ID);
    this.articleRepository.deleteById(ARTICLE_ID);
  }

  // -- SCENARIOS --

  @DisplayName("Create article for scenario")
  @Test
  @Order(1)
  @WithMockAdminUser
  void createArticleForScenarioTest() throws Exception {
    // -- PREPARE --
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    Scenario scenarioCreated = this.scenarioService.createScenario(scenario);
    SCENARIO_ID = scenarioCreated.getId();

    Channel channel = new Channel();
    channel.setName("A channel");
    channel = this.channelRepository.save(channel);
    CHANNEL_ID = channel.getId();

    ArticleCreateInput articleCreateInput = new ArticleCreateInput();
    String articleName = "My article";
    articleCreateInput.setName(articleName);
    articleCreateInput.setChannelId(CHANNEL_ID);

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                post(SCENARIO_URI + "/" + SCENARIO_ID + "/articles")
                    .content(asJsonString(articleCreateInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(articleName, JsonPath.read(response, "$.article_name"));
    ARTICLE_ID = JsonPath.read(response, "$.article_id");
  }

  @DisplayName("Retrieve articles for scenario")
  @Test
  @Order(2)
  @WithMockAdminUser
  void retrieveArticlesForScenarioTest() throws Exception {
    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                get(SCENARIO_URI + "/" + SCENARIO_ID + "/articles")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
  }

  @DisplayName("Update article for scenario")
  @Test
  @Order(3)
  @WithMockAdminUser
  void updateArticleForScenarioTest() throws Exception {
    // -- PREPARE --
    ArticleUpdateInput articleUpdateInput = new ArticleUpdateInput();
    String articleName = "My first article";
    articleUpdateInput.setName(articleName);
    articleUpdateInput.setChannelId(CHANNEL_ID);

    // -- EXECUTE --
    String response =
        this.mvc
            .perform(
                put(SCENARIO_URI + "/" + SCENARIO_ID + "/articles/" + ARTICLE_ID)
                    .content(asJsonString(articleUpdateInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(articleName, JsonPath.read(response, "$.article_name"));
  }

  @DisplayName("Delete article for scenario")
  @Test
  @Order(4)
  @WithMockAdminUser
  void deleteArticleForScenarioTest() throws Exception {
    // -- EXECUTE 1 ASSERT --
    this.mvc
        .perform(delete(SCENARIO_URI + "/" + SCENARIO_ID + "/articles/" + ARTICLE_ID))
        .andExpect(status().is2xxSuccessful());
  }
}
