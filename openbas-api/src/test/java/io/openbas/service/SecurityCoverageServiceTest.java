package io.openbas.service;

import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.InjectExpectation;
import io.openbas.database.model.InjectExpectationResult;
import io.openbas.database.model.SecurityCoverageSendJob;
import io.openbas.database.repository.SecurityCoverageSendJobRepository;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.parsing.Parser;
import io.openbas.stix.parsing.ParsingException;
import io.openbas.stix.types.Identifier;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.fixtures.files.AttackPatternFixture;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public class SecurityCoverageServiceTest extends IntegrationTest {
  @Autowired private SecurityCoverageService securityCoverageService;
  @Autowired private ExerciseComposer exerciseComposer;
  @Autowired private ScenarioComposer scenarioComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private InjectExpectationComposer injectExpectationComposer;
  @Autowired private InjectorContractComposer injectorContractComposer;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private SecurityAssessmentComposer securityAssessmentComposer;
  @Autowired private InjectorFixture injectorFixture;
  @Autowired private AttackPatternComposer attackPatternComposer;
  @Autowired private SecurityPlatformComposer securityPlatformComposer;
  @Autowired private EntityManager entityManager;
  @Autowired private SecurityCoverageSendJobService securityCoverageSendJobService;
  @Autowired private SecurityCoverageSendJobRepository securityCoverageSendJobRepository;
  @Autowired private ObjectMapper mapper;

  @BeforeEach
  public void setup() {
    exerciseComposer.reset();
    injectComposer.reset();
    injectExpectationComposer.reset();
    injectorContractComposer.reset();
    attackPatternComposer.reset();
    securityAssessmentComposer.reset();
    scenarioComposer.reset();
    securityPlatformComposer.reset();
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
                              InjectExpectation.EXPECTATION_STATUS.SUCCESS))
                      .withEndpoint(endpointComposer.forEndpoint(EndpointFixture.createEndpoint())))
              .withExpectation(
                  injectExpectationComposer
                      .forExpectation(
                          InjectExpectationFixture.createExpectationWithTypeAndStatus(
                              InjectExpectation.EXPECTATION_TYPE.PREVENTION,
                              InjectExpectation.EXPECTATION_STATUS.SUCCESS))
                      .withEndpoint(
                          endpointComposer.forEndpoint(EndpointFixture.createEndpoint()))));
    }
    return exerciseWrapper;
  }

  @Test
  @DisplayName("test")
  public void test() throws ParsingException, JsonProcessingException {
    AttackPatternComposer.Composer ap1 =
        attackPatternComposer.forAttackPattern(
            AttackPatternFixture.createAttackPatternsWithExternalId("T1234"));
    AttackPatternComposer.Composer ap2 =
        attackPatternComposer.forAttackPattern(
            AttackPatternFixture.createAttackPatternsWithExternalId("T5678"));
    SecurityPlatformComposer.Composer securityPlatformWrapper =
        securityPlatformComposer
            .forSecurityPlatform(SecurityPlatformFixture.createDefaultEDR())
            .persist();
    ExerciseComposer.Composer exerciseWrapper =
        createExerciseWrapperWithInjectsForAttackPatterns(List.of(ap1, ap2));

    injectExpectationComposer.generatedItems.forEach(
        exp ->
            exp.setResults(
                List.of(
                    InjectExpectationResult.builder()
                        .score(100.0)
                        .sourceId(securityPlatformWrapper.get().getId())
                        .sourceName("Unit Tests")
                        .sourceType("manual")
                        .build())));

    scenarioComposer
        .forScenario(ScenarioFixture.createDefaultCrisisScenario())
        .withSimulation(exerciseWrapper)
        .persist();
    entityManager.flush();
    entityManager.refresh(exerciseWrapper.get());
    securityCoverageSendJobService.createOrUpdateJobsForSimulation(List.of(exerciseWrapper.get()));
    Optional<SecurityCoverageSendJob> job =
        securityCoverageSendJobRepository.findBySimulation(exerciseWrapper.get());

    // intermediate assert
    assertThat(job).isNotEmpty();

    // act
    Bundle bundle = securityCoverageService.createBundleFromSendJobs(List.of(job.get()));

    // assert
    assertThatJson(
            bundle
                .findById(
                    new Identifier(
                        securityAssessmentComposer.generatedItems.get(0).getExternalId()))
                .toStix(mapper))
        .whenIgnoringPaths("modified")
        .isEqualTo(
            new Parser(mapper)
                .parseObject(
                    "{\"type\": \"x-security-assessment\", \"id\": \""
                        + securityAssessmentComposer.generatedItems.get(0).getExternalId()
                        + "\", \"coverage\":{\"PREVENTION\":\"1.0\",\"DETECTION\":\"1.0\"}}")
                .toStix(mapper));
  }
}
