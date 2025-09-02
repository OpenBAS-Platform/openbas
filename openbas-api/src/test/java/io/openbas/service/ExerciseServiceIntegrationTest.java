package io.openbas.service;

import static io.openbas.database.specification.TeamSpecification.fromExercise;
import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.utils.fixtures.ExerciseFixture.getExercise;
import static io.openbas.utils.fixtures.InjectFixture.getInjectForEmailContract;
import static io.openbas.utils.fixtures.TeamFixture.getTeam;
import static io.openbas.utils.fixtures.UserFixture.getUser;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import io.openbas.IntegrationTest;
import io.openbas.config.cache.LicenseCacheManager;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.ee.Ee;
import io.openbas.rest.document.DocumentService;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.rest.inject.service.InjectService;
import io.openbas.service.cron.CronService;
import io.openbas.telemetry.metric_collectors.ActionMetricCollector;
import io.openbas.utils.ResultUtils;
import io.openbas.utils.fixtures.ExerciseFixture;
import io.openbas.utils.mapper.ExerciseMapper;
import io.openbas.utils.mapper.InjectExpectationMapper;
import io.openbas.utils.mapper.InjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ExerciseServiceIntegrationTest extends IntegrationTest {

  @Mock Ee eeService;
  @Mock GrantService grantService;
  @Mock InjectDuplicateService injectDuplicateService;
  @Mock VariableService variableService;

  @Autowired private TeamService teamService;
  @Autowired private TagRuleService tagRuleService;
  @Autowired private DocumentService documentService;
  @Autowired private InjectService injectService;
  @Autowired private UserService userService;

  @Autowired private ExerciseMapper exerciseMapper;
  @Autowired private InjectMapper injectMapper;
  @Autowired private ResultUtils resultUtils;
  @Mock private ActionMetricCollector actionMetricCollector;
  @Autowired private ArticleRepository articleRepository;
  @Autowired private ExerciseRepository exerciseRepository;
  @Autowired private TeamRepository teamRepository;

  @Autowired private AssetRepository assetRepository;
  @Autowired private AssetGroupRepository assetGroupRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;
  @Autowired private UserRepository userRepository;
  @Autowired private InjectRepository injectRepository;
  @Autowired private ExerciseTeamUserRepository exerciseTeamUserRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private LessonsCategoryRepository lessonsCategoryRepository;
  @Autowired private LicenseCacheManager licenseCacheManager;
  @Autowired private InjectExpectationMapper injectExpectationMapper;
  @Autowired private CronService cronService;

  private static String USER_ID;
  private static String TEAM_ID;
  private static String INJECT_ID;

  @InjectMocks private ExerciseService exerciseService;

  @BeforeEach
  void setUp() {
    exerciseService =
        new ExerciseService(
            eeService,
            grantService,
            injectDuplicateService,
            teamService,
            variableService,
            tagRuleService,
            documentService,
            injectService,
            cronService,
            userService,
            exerciseMapper,
            injectMapper,
            resultUtils,
            actionMetricCollector,
            licenseCacheManager,
            assetRepository,
            assetGroupRepository,
            injectExpectationRepository,
            articleRepository,
            exerciseRepository,
            teamRepository,
            userRepository,
            exerciseTeamUserRepository,
            injectRepository,
            lessonsCategoryRepository,
            injectExpectationMapper);
  }

  @AfterAll
  public void teardown() {
    this.userRepository.deleteById(USER_ID);
    this.teamRepository.deleteById(TEAM_ID);
    this.injectRepository.deleteById(INJECT_ID);
  }

  @DisplayName("Should create new contextual teams while exercise duplication")
  @Test
  @Transactional(rollbackFor = Exception.class)
  void createNewContextualTeamsWhileExerciseDuplication() {
    // -- PREPARE --
    List<Team> exerciseTeams = new ArrayList<>();
    Team contextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName1", true));
    exerciseTeams.add(contextualTeam);
    Team noContextualTeam = this.teamRepository.save(getTeam(null, "fakeTeamName2", false));
    exerciseTeams.add(noContextualTeam);
    Exercise exercise = this.exerciseRepository.save(getExercise(exerciseTeams));

    // -- EXECUTE --
    Exercise exerciseDuplicated = exerciseService.getDuplicateExercise(exercise.getId());

    // -- ASSERT --
    assertNotEquals(exercise.getId(), exerciseDuplicated.getId());
    assertEquals(2, exerciseDuplicated.getTeams().size());
    exerciseDuplicated
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
  }

  @DisplayName("Should remove team from exercise")
  @Test
  void testRemoveTeams() {
    // -- PREPARE --
    User user = getUser();
    User userSaved = this.userRepository.saveAndFlush(user);
    USER_ID = userSaved.getId();
    Team team = getTeam(userSaved);
    Team teamSaved = this.teamRepository.saveAndFlush(team);
    TEAM_ID = teamSaved.getId();
    Exercise exercise = ExerciseFixture.getExercise();
    exercise.setTeams(List.of(teamSaved));
    exercise.setFrom(user.getEmail());
    Exercise exerciseSaved = this.exerciseRepository.saveAndFlush(exercise);

    InjectorContract injectorContract =
        this.injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow();
    Inject injectDefaultEmail = getInjectForEmailContract(injectorContract);
    injectDefaultEmail.setExercise(exerciseSaved);
    injectDefaultEmail.setTeams(List.of(teamSaved));
    Inject injectDefaultEmailSaved = this.injectRepository.saveAndFlush(injectDefaultEmail);
    INJECT_ID = injectDefaultEmailSaved.getId();

    // -- EXECUTE --
    this.exerciseService.removeTeams(exerciseSaved.getId(), List.of(teamSaved.getId()));

    // -- ASSERT --
    List<Team> teams = this.teamRepository.findAll(fromExercise(exerciseSaved.getId()));
    assertEquals(0, teams.size());
    Inject injectAssert = this.injectRepository.findById(INJECT_ID).orElseThrow();
    assertEquals(0, injectAssert.getTeams().size());
  }
}
