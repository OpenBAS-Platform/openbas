package io.openbas.service;

import static io.openbas.database.specification.TeamSpecification.fromScenario;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.utils.fixtures.InjectFixture.getInjectForEmailContract;
import static io.openbas.utils.fixtures.TeamFixture.getTeam;
import static io.openbas.utils.fixtures.UserFixture.getUser;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.*;

import io.openbas.database.model.*;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.*;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.utils.ExerciseMapper;
import io.openbas.utils.fixtures.AssetFixture;
import io.openbas.utils.fixtures.ScenarioFixture;
import io.openbas.utils.fixtures.TagFixture;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ScenarioServiceTest {

  @Autowired ScenarioRepository scenarioRepository;
  @Autowired private TeamRepository teamRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private DocumentRepository documentRepository;
  @Autowired private ScenarioTeamUserRepository scenarioTeamUserRepository;
  @Autowired private ArticleRepository articleRepository;

  @Autowired InjectRepository injectRepository;

  @Mock ScenarioRepository mockScenarioRepository;
  @Mock GrantService grantService;
  @Mock VariableService variableService;
  @Mock ChallengeService challengeService;
  @Autowired private TeamService teamService;
  @Mock FileService fileService;
  @Autowired private InjectDuplicateService injectDuplicateService;
  @Autowired private ExerciseMapper exerciseMapper;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private LessonsCategoryRepository lessonsCategoryRepository;
  @Mock private InjectService injectService;
  @Mock private TagRuleService tagRuleService;
  @InjectMocks private ScenarioService scenarioService;

  private static String USER_ID;
  private static String TEAM_ID;
  private static String INJECT_ID;

  @BeforeEach
  void setUp() {
    scenarioService =
        new ScenarioService(
            scenarioRepository,
            teamRepository,
            userRepository,
            documentRepository,
            scenarioTeamUserRepository,
            articleRepository,
            exerciseMapper,
            grantService,
            variableService,
            challengeService,
            teamService,
            fileService,
            injectDuplicateService,
            tagRuleService,
            injectService,
            injectRepository,
            lessonsCategoryRepository);
  }

  void setUpWithMockRepository() {
    scenarioService =
        new ScenarioService(
            mockScenarioRepository,
            teamRepository,
            userRepository,
            documentRepository,
            scenarioTeamUserRepository,
            articleRepository,
            exerciseMapper,
            grantService,
            variableService,
            challengeService,
            teamService,
            fileService,
            injectDuplicateService,
            tagRuleService,
            injectService,
            injectRepository,
            lessonsCategoryRepository);
  }

  @AfterAll
  public void teardown() {
    this.userRepository.deleteById(USER_ID);
    this.teamRepository.deleteById(TEAM_ID);
    this.injectRepository.deleteById(INJECT_ID);
  }

  @DisplayName("Should create new contextual teams during scenario duplication")
  @Test
  @Transactional(rollbackFor = Exception.class)
  void createNewContextualTeamsDuringScenarioDuplication() {
    // -- PREPARE --
    List<Team> scenarioTeams = new ArrayList<>();
    Team contextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName1", true));
    scenarioTeams.add(contextualTeam);
    Team noContextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName2", false));
    scenarioTeams.add(noContextualTeam);

    Inject inject = new Inject();
    inject.setTeams(scenarioTeams);
    Set<Inject> scenarioInjects = new HashSet<>();
    scenarioInjects.add(this.injectRepository.save(inject));
    Scenario scenario =
        this.scenarioRepository.save(ScenarioFixture.getScenario(scenarioTeams, scenarioInjects));

    // -- EXECUTE --
    Scenario scenarioDuplicated = scenarioService.getDuplicateScenario(scenario.getId());

    // -- ASSERT --
    assertNotEquals(scenario.getId(), scenarioDuplicated.getId());
    assertEquals(scenario.getFrom(), scenarioDuplicated.getFrom());
    assertEquals(2, scenarioDuplicated.getTeams().size());
    scenarioDuplicated
        .getTeams()
        .forEach(
            team -> {
              if (team.getContextual()) {
                assertNotEquals(contextualTeam.getId(), team.getId());
                assertEquals(contextualTeam.getName(), team.getName());
              } else {
                assertEquals(noContextualTeam.getId(), team.getId());
              }
            });
    assertEquals(1, scenarioDuplicated.getInjects().size());
    assertEquals(2, scenario.getInjects().getFirst().getTeams().size());
    scenarioDuplicated
        .getInjects()
        .getFirst()
        .getTeams()
        .forEach(
            injectTeam -> {
              if (injectTeam.getContextual()) {
                assertNotEquals(contextualTeam.getId(), injectTeam.getId());
                assertEquals(
                    scenarioDuplicated.getTeams().stream()
                        .filter(team -> team.getContextual().equals(true))
                        .findFirst()
                        .orElse(new Team())
                        .getId(),
                    injectTeam.getId());
              } else {
                assertEquals(noContextualTeam.getId(), injectTeam.getId());
              }
            });
  }

  @DisplayName("Should remove team from scenario")
  @Test
  void testRemoveTeams() {
    // -- PREPARE --
    User user = getUser();
    User userSaved = this.userRepository.saveAndFlush(user);
    USER_ID = userSaved.getId();
    Team team = getTeam(userSaved);
    Team teamSaved = this.teamRepository.saveAndFlush(team);
    TEAM_ID = teamSaved.getId();
    Scenario scenario = ScenarioFixture.getScenario();
    scenario.setTeams(List.of(teamSaved));
    Scenario scenarioSaved = this.scenarioRepository.saveAndFlush(scenario);

    InjectorContract injectorContract =
        this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow();
    Inject injectDefaultEmail = getInjectForEmailContract(injectorContract);
    injectDefaultEmail.setScenario(scenarioSaved);
    injectDefaultEmail.setTeams(List.of(teamSaved));
    Inject injectDefaultEmailSaved = this.injectRepository.saveAndFlush(injectDefaultEmail);
    INJECT_ID = injectDefaultEmailSaved.getId();

    // -- EXECUTE --
    this.scenarioService.removeTeams(scenarioSaved.getId(), List.of(teamSaved.getId()));

    // -- ASSERT --
    List<Team> teams = this.teamRepository.findAll(fromScenario(scenarioSaved.getId()));
    assertEquals(0, teams.size());
    Inject injectAssert = this.injectRepository.findById(INJECT_ID).orElseThrow();
    assertEquals(0, injectAssert.getTeams().size());
  }

  @Test
  public void testUpdateScenario_WITH_applyRule_true() {
    setUpWithMockRepository();
    Asset asset1 = AssetFixture.createDefaultAsset("asset1");
    Asset asset2 = AssetFixture.createDefaultAsset("asset2");
    Asset asset3 = AssetFixture.createDefaultAsset("asset3");
    Tag tag1 = TagFixture.getTag("Tag1");
    Tag tag2 = TagFixture.getTag("Tag2");
    Tag tag3 = TagFixture.getTag("Tag3");
    Scenario scenario = ScenarioFixture.getScenarioWithInjects();
    scenario.setTags(Set.of(tag1, tag2));
    Set<Tag> currentTags = Set.of(tag2, tag3);
    List<Asset> assetsToAdd = List.of(asset1, asset2);
    List<Asset> assetsToRemove = List.of(asset3);

    when(tagRuleService.getAssetsFromTagIds(List.of(tag1.getId()))).thenReturn(assetsToAdd);
    when(tagRuleService.getAssetsFromTagIds(List.of(tag3.getId()))).thenReturn(assetsToRemove);
    when(mockScenarioRepository.save(scenario)).thenReturn(scenario);

    scenarioService.updateScenario(scenario, currentTags, true);

    scenario
        .getInjects()
        .forEach(
            inject ->
                verify(injectService)
                    .applyDefaultAssetsToInject(inject.getId(), assetsToAdd, assetsToRemove));
    verify(mockScenarioRepository).save(scenario);
  }

  @Test
  public void testUpdateScenario_WITH_applyRule_false() {
    setUpWithMockRepository();
    Asset asset1 = AssetFixture.createDefaultAsset("asset1");
    Asset asset2 = AssetFixture.createDefaultAsset("asset2");
    Asset asset3 = AssetFixture.createDefaultAsset("asset3");
    Tag tag1 = TagFixture.getTag("Tag1");
    Tag tag2 = TagFixture.getTag("Tag2");
    Tag tag3 = TagFixture.getTag("Tag3");
    Scenario scenario = ScenarioFixture.getScenarioWithInjects();
    scenario.setTags(Set.of(tag1, tag2));
    Set<Tag> currentTags = Set.of(tag2, tag3);
    List<Asset> assetsToAdd = List.of(asset1, asset2);
    List<Asset> assetsToRemove = List.of(asset3);

    when(tagRuleService.getAssetsFromTagIds(List.of(tag1.getId()))).thenReturn(assetsToAdd);
    when(tagRuleService.getAssetsFromTagIds(List.of(tag3.getId()))).thenReturn(assetsToRemove);
    when(mockScenarioRepository.save(scenario)).thenReturn(scenario);

    scenarioService.updateScenario(scenario, currentTags, false);

    scenario
            .getInjects()
            .forEach(
                    inject ->
                            verify(injectService, never()).applyDefaultAssetsToInject(any(), any(), any()));
  }
}
