package io.openbas.utils;

import static io.openbas.expectation.ExpectationType.*;
import static io.openbas.utils.fixtures.ExpectationResultByTypeFixture.createDefaultExpectationResultsByType;
import static io.openbas.utils.fixtures.RawInjectExpectationFixture.createDefaultInjectExpectation;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import io.openbas.asset.AssetGroupService;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.repository.*;
import io.openbas.utils.AtomicTestingUtils.ExpectationResultsByType;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
class ResultUtilsTest {
  @Mock private InjectExpectationRepository injectExpectationRepository;
  @Mock private TeamRepository teamRepository;
  @Mock private UserRepository userRepository;
  @Mock private AssetRepository assetRepository;
  @Mock private AssetGroupRepository assetGroupRepository;
  @Mock private AssetGroupService assetGroupService;

  private ResultUtils resultUtils;

  @BeforeEach
  void before() {
    resultUtils =
        new ResultUtils(
            injectExpectationRepository,
            teamRepository,
            userRepository,
            assetRepository,
            assetGroupRepository,
            assetGroupService);
  }

  @Test
  @DisplayName("Should get calculated global scores for injects")
  void getExercisesGlobalScores() {
    String injectId1 = "103da74a-055b-40e2-a934-9605cd3e4191";
    String injectId2 = "1838c23d-3bbe-4d8e-ba40-aa8b5fd1614d";

    Set<String> injectIds = Set.of(injectId1, injectId2);

    when(injectExpectationRepository.rawForComputeGlobalByInjectIds(injectIds))
        .thenReturn(
            List.of(
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.PREVENTION.toString(), 100.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.DETECTION.toString(), 100.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.MANUAL.toString(), 0.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.PREVENTION.toString(), 50.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.DETECTION.toString(), 100.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.MANUAL.toString(), 0.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.PREVENTION.toString(), 0.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.DETECTION.toString(), 100.0, 100.0),
                createDefaultInjectExpectation(
                    InjectExpectation.EXPECTATION_TYPE.MANUAL.toString(), 0.0, 100.0)));

    var result = resultUtils.computeGlobalExpectationResults(injectIds);

    ExpectationResultsByType expectedPreventionResult =
        createDefaultExpectationResultsByType(
            PREVENTION, InjectExpectation.EXPECTATION_STATUS.PARTIAL, 1, 0, 1, 1);
    ExpectationResultsByType expectedDetectionResult =
        createDefaultExpectationResultsByType(
            DETECTION, InjectExpectation.EXPECTATION_STATUS.SUCCESS, 3, 0, 0, 0);
    ExpectationResultsByType expectedHumanResponseResult =
        createDefaultExpectationResultsByType(
            HUMAN_RESPONSE, InjectExpectation.EXPECTATION_STATUS.FAILED, 0, 0, 0, 3);

    assertEquals(
        List.of(expectedPreventionResult, expectedDetectionResult, expectedHumanResponseResult),
        result);
  }
}
