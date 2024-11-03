package io.openbas.rest;

import static io.openbas.injectors.challenge.ChallengeContract.CHALLENGE_PUBLISH;
import static io.openbas.injectors.channel.ChannelContract.CHANNEL_PUBLISH;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.rest.migration.MigrationApi.MIGRATION_URI;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.service.InjectService;
import io.openbas.utils.fixtures.InjectFixture;
import io.openbas.utils.fixtures.TeamFixture;
import io.openbas.utils.fixtures.UserFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
public class MigrationApiTest extends IntegrationTest {

  private static final List<String> INJECT_IDS = new ArrayList<>();
  private static final List<String> TEAM_IDS = new ArrayList<>();
  private static final List<String> USER_IDS = new ArrayList<>();
  private static User alice;
  private static User bob;
  private static Team emptyTeam;
  private static Team onePlayerTeam;
  private static Team twoPlayersTeam;
  private static Inject emailInject;
  private static Inject emailEmptyTeamInject;
  private static Inject emailTwoPlayersInject;
  private static Inject channelInject;
  private static Inject challengeInject;

  @Autowired private MockMvc mockMvc;

  @Autowired private UserRepository userRepository;
  @Autowired private TeamRepository teamRepository;
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @SpyBean private InjectService injectService;

  @BeforeAll
  void beforeAll() {

    // Create Players
    alice = userRepository.save(UserFixture.getUser("Alice", "TEST", "alice@fake.email"));
    bob = userRepository.save(UserFixture.getUser("Bob", "TEST", "bob@fake.email"));
    USER_IDS.addAll(List.of(alice.getId(), bob.getId()));

    // Create Team
    emptyTeam = teamRepository.save(TeamFixture.getTeam(List.of(), "EmptyTeam", false));
    onePlayerTeam =
        teamRepository.save(TeamFixture.getTeam(List.of(alice), "OnePlayerTeam", false));
    twoPlayersTeam =
        teamRepository.save(TeamFixture.getTeam(List.of(alice, bob), "TwoPlayersTeam", false));
    TEAM_IDS.addAll(List.of(emptyTeam.getId(), onePlayerTeam.getId(), twoPlayersTeam.getId()));

    // Create Injects
    InjectorContract emailContract =
        injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow();
    InjectorContract channelContract =
        injectorContractRepository.findById(CHANNEL_PUBLISH).orElseThrow();
    InjectorContract challengeContract =
        injectorContractRepository.findById(CHALLENGE_PUBLISH).orElseThrow();

    emailInject =
        injectRepository.save(InjectFixture.getInject("Test email inject", emailContract));
    emailEmptyTeamInject =
        injectRepository.save(
            InjectFixture.getInject("Test email inject with empty team", emailContract));
    emailTwoPlayersInject =
        injectRepository.save(
            InjectFixture.getInject("Test email inject with two players", emailContract));
    channelInject =
        injectRepository.save(InjectFixture.getInject("Test channel inject", channelContract));
    challengeInject =
        injectRepository.save(InjectFixture.getInject("Test challenge inject", challengeContract));
    INJECT_IDS.addAll(
        List.of(
            emailInject.getId(),
            channelInject.getId(),
            emailEmptyTeamInject.getId(),
            emailTwoPlayersInject.getId(),
            challengeInject.getId()));
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

    public static final String SYNCHRONIZE_EXPECTATIONS =
        MIGRATION_URI + "/synchronize-expectations";

    @Test
    @DisplayName("With an empty list of expectations")
    public void given_empty_list_of_expectations_should_return_success() throws Exception {
      // -- PREPARE --
      // Since we are testing an empty list of expectations, we don't need to add any expectations.

      // -- EXECUTE & ASSERT --
      mockMvc
          .perform(post(SYNCHRONIZE_EXPECTATIONS).contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertEquals(
                      "Migration completed successfully.",
                      result.getResponse().getContentAsString()));
    }

    @Test
    @DisplayName("With a user expectation without team expectation")
    public void given_only_one_player_expectation_should_add_team_expectation() throws Exception {
      // -- PREPARE --
      InjectExpectation playerExpectation = new InjectExpectation();
      playerExpectation.setType(InjectExpectation.EXPECTATION_TYPE.ARTICLE);
      playerExpectation.setUser(alice);
      playerExpectation.setTeam(onePlayerTeam);
      playerExpectation.setInject(channelInject);
      playerExpectation.setExpectedScore(100.0);
      playerExpectation.setExpirationTime(84600L);
      injectExpectationRepository.save(playerExpectation);

      assertEquals(1, injectExpectationRepository.findByInjectId(channelInject.getId()).size());

      // -- EXECUTE --
      mockMvc
          .perform(post(SYNCHRONIZE_EXPECTATIONS).contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertEquals(
                      "Migration completed successfully.",
                      result.getResponse().getContentAsString()));

      // -- ASSERT --
      assertEquals(2, injectExpectationRepository.findByInjectId(channelInject.getId()).size());
      assertTrue(
          injectExpectationRepository.findByInjectId(channelInject.getId()).stream()
              .anyMatch(exp -> exp.getUser() == null));
    }

    @Test
    @DisplayName("With a team expectation without user expectation")
    public void given_only_one_team_expectation_should_add_player_expectation() throws Exception {
      // -- PREPARE --
      InjectExpectation teamExpectation = new InjectExpectation();
      teamExpectation.setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);
      teamExpectation.setTeam(onePlayerTeam);
      teamExpectation.setInject(emailInject);
      teamExpectation.setExpectedScore(100.0);
      teamExpectation.setExpirationTime(84600L);
      injectExpectationRepository.save(teamExpectation);

      assertEquals(1, injectExpectationRepository.findByInjectId(emailInject.getId()).size());

      // -- EXECUTE --
      mockMvc
          .perform(post(SYNCHRONIZE_EXPECTATIONS).contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertEquals(
                      "Migration completed successfully.",
                      result.getResponse().getContentAsString()));

      // -- ASSERT --
      assertEquals(2, injectExpectationRepository.findByInjectId(emailInject.getId()).size());
      assertTrue(
          injectExpectationRepository.findByInjectId(emailInject.getId()).stream()
              .anyMatch(exp -> exp.getUser() != null));
    }

    @Test
    @DisplayName("With a team expectation with an empty team")
    public void
        given_only_one_team_expectation_and_empty_team_should_delete_expectations_and_call_try_inject()
            throws Exception {
      // -- PREPARE --
      InjectExpectation teamExpectation = new InjectExpectation();
      teamExpectation.setType(InjectExpectation.EXPECTATION_TYPE.MANUAL);
      teamExpectation.setTeam(emptyTeam);
      teamExpectation.setInject(emailEmptyTeamInject);
      teamExpectation.setExpectedScore(100.0);
      teamExpectation.setExpirationTime(84600L);
      injectExpectationRepository.save(teamExpectation);

      assertEquals(
          1, injectExpectationRepository.findByInjectId(emailEmptyTeamInject.getId()).size());

      // -- EXECUTE --
      mockMvc
          .perform(post(SYNCHRONIZE_EXPECTATIONS).contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertEquals(
                      "Migration completed successfully.",
                      result.getResponse().getContentAsString()));

      // -- ASSERT --
      // If the team has any players, we should re-execute the injection to synchronize the old
      // expectations with the current team and player behavior. Since the team has no players,
      // all previous expectations will be deleted.
      verify(injectService).tryInject(emailEmptyTeamInject.getId());
      assertEquals(
          0, injectExpectationRepository.findByInjectId(emailEmptyTeamInject.getId()).size());
    }

    @Test
    @DisplayName("With a team expectation and player expectations")
    public void
        given_one_team_expectation_and_two_player_expectation_should_not_add_any_expectation()
            throws Exception {
      // -- PREPARE --
      InjectExpectation teamExpectation = new InjectExpectation();
      teamExpectation.setType(InjectExpectation.EXPECTATION_TYPE.CHALLENGE);
      teamExpectation.setUser(null);
      teamExpectation.setTeam(twoPlayersTeam);
      teamExpectation.setInject(challengeInject);
      teamExpectation.setExpectedScore(100.0);
      teamExpectation.setExpirationTime(84600L);
      injectExpectationRepository.save(teamExpectation);

      InjectExpectation aliceExpectation = new InjectExpectation();
      aliceExpectation.setType(InjectExpectation.EXPECTATION_TYPE.CHALLENGE);
      aliceExpectation.setUser(alice);
      aliceExpectation.setTeam(twoPlayersTeam);
      aliceExpectation.setInject(challengeInject);
      aliceExpectation.setExpectedScore(100.0);
      aliceExpectation.setExpirationTime(84600L);
      injectExpectationRepository.save(aliceExpectation);

      InjectExpectation bobExpectation = new InjectExpectation();
      bobExpectation.setType(InjectExpectation.EXPECTATION_TYPE.CHALLENGE);
      bobExpectation.setUser(bob);
      bobExpectation.setTeam(twoPlayersTeam);
      bobExpectation.setInject(challengeInject);
      bobExpectation.setExpectedScore(100.0);
      bobExpectation.setExpirationTime(84600L);
      injectExpectationRepository.save(bobExpectation);

      assertEquals(3, injectExpectationRepository.findByInjectId(challengeInject.getId()).size());

      // -- EXECUTE --
      mockMvc
          .perform(post(SYNCHRONIZE_EXPECTATIONS).contentType(MediaType.APPLICATION_JSON))
          .andExpect(status().isOk())
          .andExpect(
              result ->
                  assertEquals(
                      "Migration completed successfully.",
                      result.getResponse().getContentAsString()));

      // -- ASSERT --
      // Since we found one team expectation and at least one player expectation, we don’t need to
      // add any additional expectations
      assertEquals(3, injectExpectationRepository.findByInjectId(challengeInject.getId()).size());
    }
  }
}
