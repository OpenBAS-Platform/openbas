package io.openbas.service;

import static io.openbas.expectation.ExpectationType.*;
import static io.openbas.utils.fixtures.ExpectationResultByTypeFixture.createDefaultExpectationResultsByType;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import io.openbas.database.model.InjectExpectation;
import io.openbas.database.repository.*;
import io.openbas.rest.exercise.form.ExercisesGlobalScoresInput;
import io.openbas.rest.exercise.service.ExerciseService;
import io.openbas.rest.inject.service.InjectDuplicateService;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import io.openbas.utils.ExerciseMapper;
import io.openbas.utils.InjectMapper;
import io.openbas.utils.ResultUtils;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class ExerciseServiceTest {

  @Mock private GrantService grantService;
  @Mock private InjectDuplicateService injectDuplicateService;
  @Mock private TeamService teamService;
  @Mock private VariableService variableService;

  @Mock private ExerciseMapper exerciseMapper;
  @Mock private InjectMapper injectMapper;
  @Mock private ResultUtils resultUtils;
  @Mock private AssetRepository assetRepository;
  @Mock private AssetGroupRepository assetGroupRepository;
  @Mock private InjectExpectationRepository injectExpectationRepository;
  @Mock private ArticleRepository articleRepository;
  @Mock private ExerciseRepository exerciseRepository;
  @Mock private TeamRepository teamRepository;
  @Mock private ExerciseTeamUserRepository exerciseTeamUserRepository;
  @Mock private InjectRepository injectRepository;
  @Mock private LessonsCategoryRepository lessonsCategoryRepository;

  @InjectMocks private ExerciseService exerciseService;

  @BeforeEach
  void setUp() {
    exerciseService =
        new ExerciseService(
            grantService,
            injectDuplicateService,
            teamService,
            variableService,
            exerciseMapper,
            injectMapper,
            resultUtils,
            assetRepository,
            assetGroupRepository,
            injectExpectationRepository,
            articleRepository,
            exerciseRepository,
            teamRepository,
            exerciseTeamUserRepository,
            injectRepository,
            lessonsCategoryRepository);
  }

  @Test
  @DisplayName("Should get exercises calculated global scores")
  void getExercisesGlobalScores() {
    String exerciseId1 = "3e95b1ea-8957-4452-b0f7-edf4003eaa98";
    String exerciseId2 = "c740797e-e34c-4066-a16c-a8baad9058f9";

    String injectId1 = "103da74a-055b-40e2-a934-9605cd3e4191";
    String injectId2 = "1838c23d-3bbe-4d8e-ba40-aa8b5fd1614d";
    String injectId3 = "0f728b68-ec1f-4a5d-a2e5-53d897c7a7fd";
    String injectId4 = "0f728b68-ec1f-4a5d-a2e5-53d897c7a7fd";

    Set<String> exercise1InjectIds = Set.of(injectId1, injectId2, injectId3);
    Set<String> exercise2InjectIds = Set.of(injectId4);

    when(exerciseRepository.findInjectsByExercise(exerciseId1)).thenReturn(exercise1InjectIds);
    when(exerciseRepository.findInjectsByExercise(exerciseId2)).thenReturn(exercise2InjectIds);

    ExpectationResultsByType exercise1Prevention =
        createDefaultExpectationResultsByType(
            PREVENTION, InjectExpectation.EXPECTATION_STATUS.PARTIAL, 1, 0, 1, 1);
    ExpectationResultsByType exercise1Detection =
        createDefaultExpectationResultsByType(
            DETECTION, InjectExpectation.EXPECTATION_STATUS.SUCCESS, 3, 0, 0, 0);
    ExpectationResultsByType exercise2Prevention =
        createDefaultExpectationResultsByType(
            PREVENTION, InjectExpectation.EXPECTATION_STATUS.FAILED, 0, 0, 0, 1);
    ExpectationResultsByType exercise3Detection =
        createDefaultExpectationResultsByType(
            DETECTION, InjectExpectation.EXPECTATION_STATUS.FAILED, 0, 0, 0, 1);

    List<ExpectationResultsByType> exercise1GlobalScores =
        List.of(exercise1Prevention, exercise1Detection);
    List<ExpectationResultsByType> exercise2GlobalScores =
        List.of(exercise2Prevention, exercise3Detection);

    when(resultUtils.getResultsByTypes(exercise1InjectIds)).thenReturn(exercise1GlobalScores);
    when(resultUtils.getResultsByTypes(exercise2InjectIds)).thenReturn(exercise2GlobalScores);

    var results =
        exerciseService.getExercisesGlobalScores(
            new ExercisesGlobalScoresInput(List.of(exerciseId1, exerciseId2)));

    assertEquals(
        results.globalScoresByExerciseIds(),
        Map.of(
            exerciseId1, exercise1GlobalScores,
            exerciseId2, exercise2GlobalScores));
  }
}
