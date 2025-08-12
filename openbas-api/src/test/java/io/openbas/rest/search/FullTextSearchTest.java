package io.openbas.rest.search;

import static io.openbas.search.FullTextSearchApi.GLOBAL_SEARCH_URI;
import static io.openbas.service.UserService.buildAuthenticationToken;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.ScenarioRepository;
import io.openbas.search.FullTextSearchApi;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.GrantComposer;
import io.openbas.utils.fixtures.composers.GroupComposer;
import io.openbas.utils.fixtures.composers.RoleComposer;
import io.openbas.utils.fixtures.composers.UserComposer;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
public class FullTextSearchTest extends IntegrationTest {

  @Autowired private MockMvc mvc;

  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private UserComposer userComposer;
  @Autowired private GroupComposer groupComposer;
  @Autowired private RoleComposer roleComposer;
  @Autowired private GrantComposer grantComposer;

  private static final List<String> SCENARIO_IDS = new ArrayList<>();
  private static Scenario testScenarioCrisis;
  private static Scenario testScenarioIncident;

  private User testUser;

  @BeforeAll
  void beforeAll() {
    Scenario scenario1 = ScenarioFixture.createDefaultCrisisScenario();
    testScenarioCrisis = this.scenarioRepository.save(scenario1);
    SCENARIO_IDS.add(testScenarioCrisis.getId());

    Scenario scenario2 = ScenarioFixture.createDefaultIncidentResponseScenario();
    testScenarioIncident = this.scenarioRepository.save(scenario2);
    SCENARIO_IDS.add(testScenarioIncident.getId());
  }

  @AfterAll
  void afterAll() {
    this.scenarioRepository.deleteAllById(SCENARIO_IDS);
  }

  @AfterEach
  void afterEach() {
    userComposer.reset();
    groupComposer.reset();
    roleComposer.reset();
    grantComposer.reset();
  }

  private static Stream<Arguments> countScenarioTestCases() {
    return Stream.of(
        Arguments.of(
            "scenario", 2, "Full text search 'scenario' returns all scenarios - Admin user"),
        Arguments.of("Crisis", 1, "Full text search 'crisis' returns 1 scenario - Admin user"),
        Arguments.of("test", 0, "Full text search 'test' returns no results - Admin user"));
  }

  @ParameterizedTest(name = "{2}")
  @MethodSource("countScenarioTestCases")
  @WithMockAdminUser
  void given_user_is_admin_search_input_should_return_count_for_all_scenarios(
      String searchTerm, int expectedCount, String testDisplayName) throws Exception {
    // -- PREPARE --
    FullTextSearchApi.SearchTerm term = new FullTextSearchApi.SearchTerm();
    term.setSearchTerm(searchTerm);

    // -- EXECUTE --
    mvc.perform(
            post(GLOBAL_SEARCH_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(term)))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$['" + Scenario.class.getName() + "'].count").value(expectedCount));
  }

  private static Stream<Arguments> searchScenarioTestCases() {
    return Stream.of(
        Arguments.of(
            "scenario",
            2,
            List.of(testScenarioCrisis.getId(), testScenarioIncident.getId()),
            "Full text search 'scenario' returns all scenarios - Admin user"),
        Arguments.of(
            "Crisis",
            1,
            List.of(testScenarioCrisis.getId()),
            "Full text search 'crisis' returns 1 scenario - Admin user"),
        Arguments.of(
            "test",
            0,
            List.<String>of(),
            "Full text search 'test' returns no results - Admin user"));
  }

  @ParameterizedTest(name = "{3}")
  @MethodSource("searchScenarioTestCases")
  @WithMockAdminUser
  void given_user_is_admin_search_input_should_return_all_scenarios(
      String searchTerm, int expectedCount, List<String> expectedIds, String testDisplayName)
      throws Exception {
    // -- PREPARE --
    SearchPaginationInput searchPaginationInput =
        PaginationFixture.getDefault().textSearch(searchTerm).build();

    // -- EXECUTE --
    mvc.perform(
            post(GLOBAL_SEARCH_URI + "/" + Scenario.class.getName())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(searchPaginationInput)))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.content.size()").value(expectedCount))
        .andExpect(jsonPath("$.content[*].id", containsInAnyOrder(expectedIds.toArray())));
  }

  @Test
  void given_user_is_admin_search_input_should_return_all_scenarios() throws Exception {
    // -- PREPARE --
    SearchPaginationInput searchPaginationInput =
        PaginationFixture.getDefault().textSearch("scenario").build();

    this.testUser =
        userComposer
            .forUser(
                UserFixture.getUser(
                    "Firstname", "Lastname", UUID.randomUUID() + "@unittests.invalid"))
            .withGroup(
                groupComposer
                    .forGroup(GroupFixture.createGroup())
                    .withRole(roleComposer.forRole(RoleFixture.getRole()))
                    .withGrant(
                        grantComposer.forGrant(
                            GrantFixture.getGrantForScenario(testScenarioCrisis)))
                    .withGrant(
                        grantComposer.forGrant(
                            GrantFixture.getGrantForScenario(testScenarioIncident))))
            .persist()
            .get();

    Authentication auth = buildAuthenticationToken(this.testUser);

    // -- EXECUTE --
    String r =
        mvc.perform(
                post(GLOBAL_SEARCH_URI + "/" + Scenario.class.getName())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(searchPaginationInput))
                    // .andExpect(status().is2xxSuccessful())
                    // .andExpect(jsonPath("$.content.size()").value(2));
                    // .andExpect(jsonPath("$.content[*].id",
                    // containsInAnyOrder(expectedIds.toArray())));
                    .with(authentication(auth)))
            .andReturn()
            .getResponse()
            .getContentAsString();

    System.out.println(r);
  }
}
