package io.openbas.rest.finding;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Filters;
import io.openbas.utils.fixtures.PaginationFixture;
import io.openbas.utils.fixtures.composers.EndpointComposer;
import io.openbas.utils.fixtures.composers.ExerciseComposer;
import io.openbas.utils.fixtures.composers.InjectComposer;
import io.openbas.utils.fixtures.composers.ScenarioComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
@Transactional
class FindingApiTest extends IntegrationTest {

  private static final String FINDING_URI = "/api/findings";

  private static final String SIMULATION_ID = "simulationId";
  private static final String SCENARIO_ID = "scenarioId";
  private static final String ENDPOINT_ID = "endpointId";

  @Resource protected ObjectMapper mapper;
  @Autowired private MockMvc mvc;

  @Autowired private FindingComposer findingComposer;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private ScenarioComposer scenarioComposer;
  @Autowired private ExerciseComposer simulationComposer;

  @DisplayName("Search global findings")
  @Test
  @WithMockAdminUser
  public void given_a_search_input_should_return_page_of_findings() throws Exception {

    SearchPaginationInput input = new SearchPaginationInput();
    Filters.FilterGroup filterGroup = new Filters.FilterGroup();
    filterGroup.setMode(Filters.FilterMode.and);

    Filters.Filter name = new Filters.Filter();
    name.setKey("findings_name");
    name.setMode(Filters.FilterMode.and);
    name.setValues(List.of("Port"));
    name.setOperator(Filters.FilterOperator.contains);

    Filters.Filter type = new Filters.Filter();
    type.setKey("findings_type");
    type.setMode(Filters.FilterMode.and);
    type.setValues(List.of("PortScan"));
    type.setOperator(Filters.FilterOperator.contains);

    Filters.Filter value = new Filters.Filter();
    value.setKey("findings_value");
    value.setMode(Filters.FilterMode.and);
    value.setValues(List.of("0.0.0.0:135 (LISTENING)"));
    value.setOperator(Filters.FilterOperator.contains);

    Filters.Filter createdAt = new Filters.Filter();
    createdAt.setKey("findings_created_at");
    createdAt.setMode(Filters.FilterMode.and);
    createdAt.setValues(List.of("2025-04-01T22:00:00.000Z"));
    createdAt.setOperator(Filters.FilterOperator.eq);

    Filters.Filter tags = new Filters.Filter();
    tags.setKey("findings_tags");
    tags.setMode(Filters.FilterMode.and);
    tags.setValues(List.of("a4ec8889-792f-43b3-a3f2-241aa4bc6cf8"));
    tags.setOperator(Filters.FilterOperator.contains);

    Filters.Filter inject = new Filters.Filter();
    inject.setKey("findings_inject");
    inject.setMode(Filters.FilterMode.and);
    inject.setValues(List.of("40485dde-61b5-4c27-9251-da5a377d8f8a"));
    inject.setOperator(Filters.FilterOperator.contains);

    Filters.Filter endpoint = new Filters.Filter();
    endpoint.setKey("findings_endpoint");
    endpoint.setMode(Filters.FilterMode.and);
    endpoint.setValues(List.of("40485dde-61b5-4c27-9251-da5a377d8f8a"));
    endpoint.setOperator(Filters.FilterOperator.contains);

    Filters.Filter simulation = new Filters.Filter();
    simulation.setKey("findings_simulation");
    simulation.setMode(Filters.FilterMode.and);
    simulation.setValues(List.of("40485dde-61b5-4c27-9251-da5a377d8f8a"));
    simulation.setOperator(Filters.FilterOperator.contains);

    Filters.Filter scenario = new Filters.Filter();
    scenario.setKey("findings_scenario");
    scenario.setMode(Filters.FilterMode.and);
    scenario.setValues(List.of("40485dde-61b5-4c27-9251-da5a377d8f8a"));
    scenario.setOperator(Filters.FilterOperator.contains);

    filterGroup.setFilters(
        List.of(name, type, value, createdAt, tags, inject, endpoint, simulation, scenario));
    input.setFilterGroup(filterGroup);

    performCallbackRequest(FINDING_URI + "/search", input);
  }

  @DisplayName("Search findings by simulation")
  @Test
  @WithMockAdminUser
  public void given_a_search_input_should_return_page_of_findings_by_simulation() throws Exception {

    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().build();

    performCallbackRequest(
        FINDING_URI + "/exercises/" + SIMULATION_ID + "/search", searchPaginationInput);
  }

  @DisplayName("Search findings by scenario")
  @Test
  @WithMockAdminUser
  public void given_a_search_input_should_return_page_of_findings_by_scenario() throws Exception {

    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().build();

    performCallbackRequest(
        FINDING_URI + "/scenarios/" + SCENARIO_ID + "/search", searchPaginationInput);
  }

  @DisplayName("Search findings by endpoint")
  @Test
  @WithMockAdminUser
  public void given_a_search_input_should_return_page_of_findings_by_endpoint() throws Exception {

    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().build();

    performCallbackRequest(
        FINDING_URI + "/endpoints/" + ENDPOINT_ID + "/search", searchPaginationInput);
  }

  private String performCallbackRequest(
      String FINDING_URI, SearchPaginationInput searchPaginationInput) throws Exception {
    return mvc.perform(
            post(FINDING_URI)
                .content(asJsonString(searchPaginationInput))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }
}
