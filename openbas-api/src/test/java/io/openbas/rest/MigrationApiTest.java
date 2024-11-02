package io.openbas.rest;

import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.rest.migration.MigrationApi.MIGRATION_URI;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.User;
import io.openbas.database.repository.*;
import io.openbas.utils.fixtures.InjectFixture;
import io.openbas.utils.fixtures.TeamFixture;
import io.openbas.utils.fixtures.UserFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
public class MigrationApiTest extends IntegrationTest {

  private static final List<String> INJECT_IDS = new ArrayList<>();
  private static final List<String> TEAM_IDS = new ArrayList<>();
  private static final List<String> USER_IDS = new ArrayList<>();

  @Autowired private MockMvc mockMvc;

  @Autowired private UserRepository userRepository;
  @Autowired private TeamRepository teamRepository;
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;

  @BeforeAll
  void beforeAll() {
    // Create Players
    User alice = userRepository.save(UserFixture.getUser("Alice", "TEST", "tom-test@fake.email"));
    User bob = userRepository.save(UserFixture.getUser("Bob", "TEST", "ben-test@fake.email"));
    USER_IDS.addAll(List.of(alice.getId(), bob.getId()));

    // Create Team
    TEAM_IDS.add(
        teamRepository
            .save(TeamFixture.getTeam(List.of(alice, bob), "TeamTwoPlayers", false))
            .getId());
    TEAM_IDS.add(
        teamRepository.save(TeamFixture.getTeam(List.of(), "TeamWithoutPlayers", false)).getId());

    // Create Injects
    InjectorContract emailContract =
        injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow();
    InjectorContract channelContract =
        injectorContractRepository.findById(CHANNEL_PUBLISH).orElseThrow();

    INJECT_IDS.add(
        injectRepository.save(InjectFixture.getInject("Test email inject", emailContract)).getId());
    INJECT_IDS.add(
        injectRepository
            .save(InjectFixture.getInject("Test channel inject", channelContract))
            .getId());
  }

  @AfterAll
  void afterAll() {
    this.injectRepository.deleteAllById(INJECT_IDS);
    this.teamRepository.deleteAllById(TEAM_IDS);
    this.userRepository.deleteAllById(USER_IDS);
  }

  @Nested
  @WithMockAdminUser
  @DisplayName("Syncronize team and player expectations")
  class SynchronizeTeamAndPlayerExpectations {

    @Test
    @WithMockAdminUser
    public void testProcessExpectations_Error() throws Exception {
      // -- PREPARE --

      // -- EXECUTE & ASSERT --
      mockMvc
          .perform(
              post("/api/migrations/process-expectations").contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isInternalServerError())
          .andExpect(
              result ->
                  assertEquals(
                      "Migration failed: Database error",
                      result.getResponse().getContentAsString()));
    }

    @Test
    @DisplayName("With an empty list of expectations")
    public void testProcessExpectations_Success() throws Exception {
      // -- PREPARE --
      // As we test an empty list of expectations so we dont need to add any expectation

      // -- EXECUTE & ASSERT --
      mockMvc
          .perform(post(MIGRATION_URI).contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertEquals(
                      "Migration completed successfully.",
                      result.getResponse().getContentAsString()));
    }
  }
}
