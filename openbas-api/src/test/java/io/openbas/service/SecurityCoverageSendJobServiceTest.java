package io.openbas.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import io.openbas.IntegrationTest;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.database.repository.SecurityCoverageSendJobRepository;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.fixtures.files.AttackPatternFixture;
import jakarta.persistence.EntityManager;
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
  @Autowired private InjectorFixture injectorFixture;
  @Autowired private AttackPatternComposer attackPatternComposer;
  @Autowired private EntityManager entityManager;
  @Autowired private InjectExpectationService injectExpectationService;
  @Autowired private SecurityCoverageSendJobRepository securityCoverageSendJobRepository;

  @BeforeEach
  public void setup() {
    exerciseComposer.reset();
    injectComposer.reset();
    injectExpectationComposer.reset();
    injectorContractComposer.reset();
    attackPatternComposer.reset();
    securityAssessmentComposer.reset();
  }

  private ExerciseComposer.Composer createExerciseWrapperWithInjectsForAttackPatterns(
      List<AttackPatternComposer.Composer> attackPatternWrappers) {
    // ensure attack patterns have IDs
    attackPatternWrappers.forEach(AttackPatternComposer.Composer::persist);

    ExerciseComposer.Composer exerciseWrapper =
        exerciseComposer
            .forExercise(ExerciseFixture.createDefaultExercise())
            .withSecurityAssessment(
                securityAssessmentComposer.forSecurityAssessment(
                    SecurityAssessmentFixture.createSecurityAssessmentWithAttackPatterns(
                        attackPatternWrappers.stream()
                            .map(AttackPatternComposer.Composer::get)
                            .toList())));

    for (AttackPatternComposer.Composer apw : attackPatternWrappers) {
      exerciseWrapper.withInject(
          injectComposer
              .forInject(InjectFixture.getDefaultInject())
              .withInjectorContract(
                  injectorContractComposer
                      .forInjectorContract(InjectorContractFixture.createDefaultInjectorContract())
                      .withInjector(injectorFixture.getWellKnownObasImplantInjector())
                      .withAttackPattern(apw))
              .withExpectation(
                  injectExpectationComposer
                      .forExpectation(
                          InjectExpectationFixture.createExpectationWithTypeAndStatus(
                              InjectExpectation.EXPECTATION_TYPE.DETECTION,
                              InjectExpectation.EXPECTATION_STATUS.PENDING))
                      .withEndpoint(endpointComposer.forEndpoint(EndpointFixture.createEndpoint())))
              .withExpectation(
                  injectExpectationComposer
                      .forExpectation(
                          InjectExpectationFixture.createExpectationWithTypeAndStatus(
                              InjectExpectation.EXPECTATION_TYPE.PREVENTION,
                              InjectExpectation.EXPECTATION_STATUS.PENDING))
                      .withEndpoint(
                          endpointComposer.forEndpoint(EndpointFixture.createEndpoint()))));
    }

    return exerciseWrapper;
  }

  @Test
  @DisplayName("Adding result to expectation does not trigger coverage job")
  public void addingResultDoesNotTriggerCoverageJob() {
    AttackPatternComposer.Composer ap1 =
        attackPatternComposer.forAttackPattern(
            AttackPatternFixture.createAttackPatternsWithExternalId("T1234"));
    AttackPatternComposer.Composer ap2 =
        attackPatternComposer.forAttackPattern(
            AttackPatternFixture.createAttackPatternsWithExternalId("T5678"));
    ExerciseComposer.Composer exerciseWrapper =
        createExerciseWrapperWithInjectsForAttackPatterns(List.of(ap1, ap2));

    exerciseWrapper.persist();
    entityManager.flush();
    entityManager.clear();

    // act
    InjectExpectation exp = injectExpectationComposer.generatedItems.getFirst();
    ExpectationUpdateInput input =
        new ExpectationUpdateInput(UUID.randomUUID().toString(), "manual", "Unit Tests", 100.0);
    injectExpectationService.updateInjectExpectation(exp.getId(), input);
    entityManager.flush();
    entityManager.clear();

    // assert
    Optional<SecurityCoverageSendJob> job =
        securityCoverageSendJobRepository.findBySimulation(exerciseWrapper.get());
    assertThat(job).isEmpty();
  }

  @Test
  @DisplayName("Adding final result to expectation does trigger coverage job")
  public void addingFinalResultDoesTriggerCoverageJob() {
    AttackPatternComposer.Composer ap1 =
        attackPatternComposer.forAttackPattern(
            AttackPatternFixture.createAttackPatternsWithExternalId("T1234"));
    AttackPatternComposer.Composer ap2 =
        attackPatternComposer.forAttackPattern(
            AttackPatternFixture.createAttackPatternsWithExternalId("T5678"));
    ExerciseComposer.Composer exerciseWrapper =
        createExerciseWrapperWithInjectsForAttackPatterns(List.of(ap1, ap2));

    exerciseWrapper.persist();
    entityManager.flush();
    entityManager.clear();

    // act
    for (InjectExpectation exp : injectExpectationComposer.generatedItems) {
      ExpectationUpdateInput input =
          new ExpectationUpdateInput(UUID.randomUUID().toString(), "manual", "Unit Tests", 100.0);
      injectExpectationService.updateInjectExpectation(exp.getId(), input);
    }
    entityManager.flush();
    entityManager.clear();

    // assert
    Optional<SecurityCoverageSendJob> job =
        securityCoverageSendJobRepository.findBySimulation(exerciseWrapper.get());
    assertThat(job).isNotEmpty();
  }
}
