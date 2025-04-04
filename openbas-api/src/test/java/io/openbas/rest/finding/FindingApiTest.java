package io.openbas.rest.finding;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.utils.fixtures.PaginationFixture;
import io.openbas.utils.fixtures.composers.EndpointComposer;
import io.openbas.utils.fixtures.composers.ExerciseComposer;
import io.openbas.utils.fixtures.composers.InjectComposer;
import io.openbas.utils.fixtures.composers.ScenarioComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.transaction.Transactional;
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

    SearchPaginationInput searchPaginationInput = PaginationFixture.getDefault().build();

    performCallbackRequest(FINDING_URI + "/search/", searchPaginationInput);
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
