package io.openbas.rest.finding;

import static io.openbas.rest.finding.FindingFixture.TEXT_FIELD;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@TestInstance(PER_CLASS)
@Transactional
@WithMockAdminUser
class FindingApiTest extends IntegrationTest {

  private static final String FINDING_URI = "/api/findings";

  @Resource protected ObjectMapper mapper;
  @Autowired private MockMvc mvc;

  @Autowired private FindingComposer findingComposer;
  @Autowired private AssetGroupComposer assetGroupComposer;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private ScenarioComposer scenarioComposer;
  @Autowired private ExerciseComposer simulationComposer;
  @Autowired private AgentComposer agentComposer;
  @Autowired private TagComposer tagComposer;
  private Exercise savedSimulation;
  private Scenario savedScenario;
  private AssetGroup savedAssetGroup;
  private Endpoint savedEndpoint;
  private InjectComposer.Composer injectComposer1;
  private EndpointComposer.Composer endpointComposer1;

  @BeforeEach
  void setup() {
    injectComposer1 = injectComposer.forInject(InjectFixture.getDefaultInject());

    savedSimulation =
        simulationComposer
            .forExercise(ExerciseFixture.createDefaultExercise())
            .withInject(injectComposer1)
            .persist()
            .get();

    savedScenario =
        scenarioComposer
            .forScenario(ScenarioFixture.getScenario())
            .withInject(injectComposer1)
            .persist()
            .get();

    endpointComposer1 = endpointComposer.forEndpoint(EndpointFixture.createEndpoint());

    savedEndpoint =
        endpointComposer1
            .withAgent(agentComposer.forAgent(AgentFixture.createDefaultAgentService()))
            .persist()
            .get();

    savedAssetGroup =
        assetGroupComposer
            .forAssetGroup(AssetGroupFixture.createDefaultAssetGroup("asset-group"))
            .withAsset(endpointComposer1)
            .persist()
            .get();
  }

  @DisplayName("Search global findings")
  @Test
  public void given_a_search_input_should_return_page_of_findings() throws Exception {
    Finding savedFinding =
        findingComposer
            .forFinding(FindingFixture.createDefaultTextFinding())
            .withEndpoint(endpointComposer.forEndpoint(savedEndpoint))
            .withInject(injectComposer1)
            .withTag(tagComposer.forTag(TagFixture.getTagWithText("Finding")))
            .persist()
            .get();
    SearchPaginationInput input =
        buildDefaultFilters(
            ContractOutputType.Text,
            "Text",
            savedFinding,
            savedSimulation,
            savedScenario,
            savedEndpoint,
            savedAssetGroup);

    performCallbackRequest(FINDING_URI + "/search", input)
        .andExpect(jsonPath("$.content.[0].finding_type").value(savedFinding.getType().label))
        .andExpect(jsonPath("$.content.[0].finding_name").value("Text"))
        .andExpect(jsonPath("$.content.[0].finding_field").value(TEXT_FIELD))
        .andExpect(jsonPath("$.content.[0].finding_value").value("text_value"))
        .andExpect(
            jsonPath("$.content.[0].finding_assets.[0].asset_id").value(savedEndpoint.getId()))
        .andExpect(
            jsonPath("$.content.[0].finding_inject.inject_id")
                .value(savedFinding.getInject().getId()))
        .andExpect(
            jsonPath("$.content.[0].finding_simulation.exercise_id").value(savedSimulation.getId()))
        .andExpect(
            jsonPath("$.content.[0].finding_scenario.scenario_id").value(savedScenario.getId()));
  }

  @Test
  @DisplayName("Search findings by simulation")
  void should_return_findings_by_simulation() throws Exception {
    Finding savedFinding =
        findingComposer
            .forFinding(FindingFixture.createDefaultIPV6Finding())
            .withEndpoint(endpointComposer.forEndpoint(savedEndpoint))
            .withInject(injectComposer1)
            .withTag(tagComposer.forTag(TagFixture.getTagWithText("Finding IPv6")))
            .persist()
            .get();
    SearchPaginationInput input =
        buildDefaultFilters(
            ContractOutputType.IPv6,
            "IPv6",
            savedFinding,
            savedSimulation,
            null,
            savedEndpoint,
            null);

    performCallbackRequest(FINDING_URI + "/exercises/" + savedSimulation.getId() + "/search", input)
        .andExpect(jsonPath("$.content.[0].finding_type").value(savedFinding.getType().label))
        .andExpect(
            jsonPath("$.content.[0].finding_value")
                .value("2001:0000:130F:0000:0000:09C0:876A:130B"));
  }

  @Test
  @DisplayName("Search findings by scenario")
  void should_return_findings_by_scenario() throws Exception {
    Finding savedFinding =
        findingComposer
            .forFinding(FindingFixture.createDefaultFindingCredentials())
            .withEndpoint(endpointComposer.forEndpoint(savedEndpoint))
            .withInject(injectComposer1)
            .withTag(tagComposer.forTag(TagFixture.getTagWithText("Finding")))
            .persist()
            .get();
    SearchPaginationInput input =
        buildDefaultFilters(
            ContractOutputType.Credentials,
            "Credentials",
            savedFinding,
            null,
            savedScenario,
            savedEndpoint,
            savedAssetGroup);

    performCallbackRequest(FINDING_URI + "/scenarios/" + savedScenario.getId() + "/search", input)
        .andExpect(
            jsonPath("$.content.[0].finding_scenario.scenario_id").value(savedScenario.getId()))
        .andExpect(jsonPath("$.content.[0].finding_type").value(savedFinding.getType().label))
        .andExpect(jsonPath("$.content.[0].finding_value").value("admin:admin"));
  }

  @Test
  @DisplayName("Search findings by endpoint")
  void should_return_findings_by_endpoint() throws Exception {
    Finding savedFinding =
        findingComposer
            .forFinding(FindingFixture.createDefaultTextFinding())
            .withEndpoint(endpointComposer.forEndpoint(savedEndpoint))
            .withInject(injectComposer1)
            .withTag(tagComposer.forTag(TagFixture.getTagWithText("Finding Text")))
            .persist()
            .get();
    SearchPaginationInput input =
        buildDefaultFilters(
            ContractOutputType.Text, "Text", savedFinding, null, null, savedEndpoint, null);

    performCallbackRequest(FINDING_URI + "/endpoints/" + savedEndpoint.getId() + "/search", input)
        .andExpect(
            jsonPath("$.content.[0].finding_assets.[0].asset_id").value(savedEndpoint.getId()))
        .andExpect(jsonPath("$.content.[0].finding_type").value(savedFinding.getType().label))
        .andExpect(jsonPath("$.content.[0].finding_value").value("text_value"));
  }

  private SearchPaginationInput buildDefaultFilters(
      ContractOutputType type,
      String name,
      Finding finding,
      Exercise simulation,
      Scenario scenario,
      Endpoint endpoint,
      AssetGroup assetGroup) {
    SearchPaginationInput input = new SearchPaginationInput();
    Filters.FilterGroup group = new Filters.FilterGroup();
    group.setMode(Filters.FilterMode.and);

    Instant now = Instant.now().minus(1, ChronoUnit.DAYS);

    List<Filters.Filter> filters = new ArrayList<>();

    filters.add(buildFilter("finding_type", Filters.FilterOperator.contains, List.of(type.label)));
    filters.add(buildFilter("finding_name", Filters.FilterOperator.contains, List.of(name)));
    filters.add(
        buildFilter("finding_created_at", Filters.FilterOperator.gt, List.of(now.toString())));
    filters.add(
        buildFilter(
            "finding_tags",
            Filters.FilterOperator.contains,
            List.of(finding.getTags().stream().findFirst().get().getId())));
    filters.add(
        buildFilter(
            "finding_inject_id",
            Filters.FilterOperator.contains,
            List.of(finding.getInject().getId())));

    if (assetGroup != null) {
      filters.add(
          buildFilter(
              "finding_asset_groups",
              Filters.FilterOperator.contains,
              List.of(assetGroup.getId())));
    }
    if (endpoint != null) {
      filters.add(
          buildFilter(
              "finding_assets", Filters.FilterOperator.contains, List.of(endpoint.getId())));
    }
    if (simulation != null) {
      filters.add(
          buildFilter(
              "finding_simulation", Filters.FilterOperator.contains, List.of(simulation.getId())));
    }
    if (scenario != null) {
      filters.add(
          buildFilter(
              "finding_scenario", Filters.FilterOperator.contains, List.of(scenario.getId())));
    }

    group.setFilters(filters);
    input.setFilterGroup(group);
    return input;
  }

  private Filters.Filter buildFilter(
      String key, Filters.FilterOperator operator, List<String> values) {
    Filters.Filter filter = new Filters.Filter();
    filter.setKey(key);
    filter.setMode(Filters.FilterMode.and);
    filter.setOperator(operator);
    filter.setValues(values);
    return filter;
  }

  private ResultActions performCallbackRequest(String uri, SearchPaginationInput input)
      throws Exception {
    return mvc.perform(
            post(uri)
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());
  }
}
