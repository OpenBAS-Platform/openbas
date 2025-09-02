package io.openbas.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Exercise;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.database.repository.SecurityCoverageSendJobRepository;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public class SecurityCoverageSendJobServiceTest extends IntegrationTest {
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private InjectExpectationComposer injectExpectationComposer;
  @Autowired private InjectorContractComposer injectorContractComposer;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private SecurityAssessmentComposer securityAssessmentComposer;
  @Autowired private ScenarioComposer scenarioComposer;
  @Autowired private InjectorFixture injectorFixture;
  @Autowired private EntityManager entityManager;
  @Autowired private SecurityCoverageSendJobService securityCoverageSendJobService;
  @Autowired private SecurityCoverageSendJobRepository securityCoverageSendJobRepository;

  @BeforeEach
  public void setup() {
    exerciseComposer.reset();
    injectComposer.reset();
    injectExpectationComposer.reset();
    injectorContractComposer.reset();
    securityAssessmentComposer.reset();
    scenarioComposer.reset();
  }

  private ExerciseComposer.Composer createExerciseWrapper() {

    ExerciseComposer.Composer exerciseWrapper =
        exerciseComposer
            .forExercise(ExerciseFixture.createDefaultExercise())
            .withSecurityAssessment(
                securityAssessmentComposer.forSecurityAssessment(
                    SecurityAssessmentFixture.createDefaultSecurityAssessment()))
            .withInject(
                injectComposer
                    .forInject(InjectFixture.getDefaultInject())
                    .withInjectorContract(
                        injectorContractComposer
                            .forInjectorContract(
                                InjectorContractFixture.createDefaultInjectorContract())
                            .withInjector(injectorFixture.getWellKnownObasImplantInjector()))
                    .withExpectation(
                        injectExpectationComposer
                            .forExpectation(
                                InjectExpectationFixture.createExpectationWithTypeAndStatus(
                                    InjectExpectation.EXPECTATION_TYPE.DETECTION,
                                    InjectExpectation.EXPECTATION_STATUS.PENDING))
                            .withEndpoint(
                                endpointComposer.forEndpoint(EndpointFixture.createEndpoint())))
                    .withExpectation(
                        injectExpectationComposer
                            .forExpectation(
                                InjectExpectationFixture.createExpectationWithTypeAndStatus(
                                    InjectExpectation.EXPECTATION_TYPE.PREVENTION,
                                    InjectExpectation.EXPECTATION_STATUS.PENDING))
                            .withEndpoint(
                                endpointComposer.forEndpoint(EndpointFixture.createEndpoint()))));
    ;
    return exerciseWrapper;
  }

  @Test
  @DisplayName("Adding result to expectation does not trigger coverage job")
  public void addingResultDoesNotTriggerCoverageJob() {
    ExerciseComposer.Composer exerciseWrapper = createExerciseWrapper();

    injectExpectationComposer
        .generatedItems
        .getFirst()
        .setResults(
            List.of(
                InjectExpectationResult.builder()
                    .score(100.0)
                    .sourceId(UUID.randomUUID().toString())
                    .sourceName("Unit Tests")
                    .sourceType("manual")
                    .build()));

    exerciseWrapper.persist();
    entityManager.flush();
    entityManager.refresh(exerciseWrapper.get());

    // act
    securityCoverageSendJobService.createOrUpdateCoverageSendJobForSimulationsIfReady(
        List.of(exerciseWrapper.get()));
    entityManager.flush();

    // assert
    Optional<SecurityCoverageSendJob> job =
        securityCoverageSendJobRepository.findBySimulation(exerciseWrapper.get());
    assertThat(job).isEmpty();
  }

  @Test
  @DisplayName("Adding final result to expectation does trigger coverage job")
  public void addingFinalResultDoesTriggerCoverageJob() {
    ExerciseComposer.Composer exerciseWrapper = createExerciseWrapper();

    injectExpectationComposer.generatedItems.forEach(
        exp ->
            exp.setResults(
                List.of(
                    InjectExpectationResult.builder()
                        .score(100.0)
                        .sourceId(UUID.randomUUID().toString())
                        .sourceName("Unit Tests")
                        .sourceType("manual")
                        .build())));

    scenarioComposer
        .forScenario(ScenarioFixture.createDefaultCrisisScenario())
        .withSimulation(exerciseWrapper)
        .persist();
    entityManager.flush();
    entityManager.refresh(exerciseWrapper.get());

    // act
    securityCoverageSendJobService.createOrUpdateCoverageSendJobForSimulationsIfReady(
        List.of(exerciseWrapper.get()));
    entityManager.flush();

    // assert
    Optional<SecurityCoverageSendJob> job =
        securityCoverageSendJobRepository.findBySimulation(exerciseWrapper.get());
    assertThat(job).isNotEmpty();
  }

  @Test
  @DisplayName(
      "Adding final result to expectation but there is a following simulation, does NOT trigger coverage job")
  public void addingFinalResultButThereIsAFollowingSimulationDoesNOTTriggerCoverageJob() {
    ExerciseComposer.Composer exerciseWrapper = createExerciseWrapper();

    injectExpectationComposer.generatedItems.forEach(
        exp ->
            exp.setResults(
                List.of(
                    InjectExpectationResult.builder()
                        .score(100.0)
                        .sourceId(UUID.randomUUID().toString())
                        .sourceName("Unit Tests")
                        .sourceType("manual")
                        .build())));

    exerciseWrapper.get().setStart(Instant.parse("2005-05-30T23:22:10Z"));
    Exercise otherSimulation = ExerciseFixture.createDefaultExercise();
    otherSimulation.setStart(Instant.parse("2005-05-30T23:56:32Z"));

    ScenarioComposer.Composer scenarioWrapper =
        scenarioComposer
            .forScenario(ScenarioFixture.createDefaultCrisisScenario())
            .withSimulation(exerciseWrapper)
            .persist();
    entityManager.flush();
    scenarioWrapper.withSimulation(exerciseComposer.forExercise(otherSimulation)).persist();
    entityManager.flush();
    entityManager.refresh(exerciseWrapper.get());

    // act
    securityCoverageSendJobService.createOrUpdateCoverageSendJobForSimulationsIfReady(
        List.of(exerciseWrapper.get()));
    entityManager.flush();

    // assert
    Optional<SecurityCoverageSendJob> job =
        securityCoverageSendJobRepository.findBySimulation(exerciseWrapper.get());
    assertThat(job).isEmpty();
  }
}
