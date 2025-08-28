package io.openbas.service;

import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.SecurityCoverageSendJobRepository;
import io.openbas.stix.objects.Bundle;
import io.openbas.stix.objects.DomainObject;
import io.openbas.stix.objects.RelationshipObject;
import io.openbas.stix.objects.constants.CommonProperties;
import io.openbas.stix.objects.constants.ObjectTypes;
import io.openbas.stix.parsing.Parser;
import io.openbas.stix.parsing.ParsingException;
import io.openbas.stix.types.BaseType;
import io.openbas.stix.types.Dictionary;
import io.openbas.stix.types.Identifier;
import io.openbas.stix.types.StixString;
import io.openbas.utils.InjectExpectationResultUtils;
import io.openbas.utils.ResultUtils;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.fixtures.files.AttackPatternFixture;
import jakarta.persistence.EntityManager;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
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
  @Autowired private ResultUtils resultUtils;
  private Parser stixParser;

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

    stixParser = new Parser(mapper);
  }

  /*
   * attackPatternWrappers: map of attack pattern, isCovered bool
   * set isCovered to true if there should be an inject covering this attack pattern
   * otherwise, false means the attack pattern will be "uncovered"
   */
  private ExerciseComposer.Composer createExerciseWrapperWithInjectsForAttackPatterns(
      Map<AttackPatternComposer.Composer, Boolean> attackPatternWrappers) {
    // ensure attack patterns have IDs
    attackPatternWrappers.keySet().forEach(AttackPatternComposer.Composer::persist);

    ExerciseComposer.Composer exerciseWrapper =
        exerciseComposer
            .forExercise(ExerciseFixture.createDefaultExercise())
            .withSecurityAssessment(
                securityAssessmentComposer.forSecurityAssessment(
                    SecurityAssessmentFixture.createSecurityAssessmentWithAttackPatterns(
                        attackPatternWrappers.keySet().stream()
                            .map(AttackPatternComposer.Composer::get)
                            .toList())));

    for (Map.Entry<AttackPatternComposer.Composer, Boolean> apw :
        attackPatternWrappers.entrySet()) {
      if (apw.getValue()) { // this attack pattern should be covered
        exerciseWrapper.withInject(
            injectComposer
                .forInject(InjectFixture.getDefaultInject())
                .withInjectorContract(
                    injectorContractComposer
                        .forInjectorContract(
                            InjectorContractFixture.createDefaultInjectorContract())
                        .withInjector(injectorFixture.getWellKnownObasImplantInjector())
                        .withAttackPattern(apw.getKey()))
                .withExpectation(
                    injectExpectationComposer
                        .forExpectation(
                            InjectExpectationFixture.createExpectationWithTypeAndStatus(
                                InjectExpectation.EXPECTATION_TYPE.DETECTION,
                                InjectExpectation.EXPECTATION_STATUS.SUCCESS))
                        .withEndpoint(
                            endpointComposer.forEndpoint(EndpointFixture.createEndpoint())))
                .withExpectation(
                    injectExpectationComposer
                        .forExpectation(
                            InjectExpectationFixture.createExpectationWithTypeAndStatus(
                                InjectExpectation.EXPECTATION_TYPE.PREVENTION,
                                InjectExpectation.EXPECTATION_STATUS.SUCCESS))
                        .withEndpoint(
                            endpointComposer.forEndpoint(EndpointFixture.createEndpoint()))));
      }
    }
    return exerciseWrapper;
  }

  private DomainObject addPropertiesToDomainObject(
      DomainObject obj, Map<String, BaseType<?>> props) {
    for (Map.Entry<String, BaseType<?>> entry : props.entrySet()) {
      obj.setProperty(entry.getKey(), entry.getValue());
    }
    return obj;
  }

  private Dictionary predictCoverageFromInjects(List<Inject> injects) {
    List<InjectExpectationResultUtils.ExpectationResultsByType> results =
        resultUtils.computeGlobalExpectationResults(
            injects.stream().map(Inject::getId).collect(Collectors.toSet()));
    Map<String, BaseType<?>> dict = new HashMap<>();
    for (InjectExpectationResultUtils.ExpectationResultsByType result : results) {
      dict.put(result.type().toString(), new StixString(String.valueOf(result.getSuccessRate())));
    }
    return toDictionary(dict);
  }

  private Dictionary toDictionary(Map<String, BaseType<?>> map) {
    return new Dictionary(map);
  }

  private DomainObject getExpectedMainSecurityCoverage(
      SecurityAssessment securityAssessment, List<Inject> injects)
      throws ParsingException, JsonProcessingException {
    return addPropertiesToDomainObject(
        (DomainObject) stixParser.parseObject(securityAssessment.getContent()),
        Map.of("coverage", predictCoverageFromInjects(injects)));
  }

  private List<DomainObject> getExpectedPlatformIdentities(
      List<SecurityPlatform> securityPlatforms) {
    return securityPlatforms.stream().map(SecurityPlatform::toStixDomainObject).toList();
  }

  @Test
  @DisplayName(
      "When all attack patterns are covered and all expectations are successful, bundle is correct")
  public void whenAllAttackPatternsAreCoveredAndAllExpectationsAreSuccessful_bundleIsCorrect()
      throws ParsingException, JsonProcessingException {
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
    // create exercise cover all TTPs
    ExerciseComposer.Composer exerciseWrapper =
        createExerciseWrapperWithInjectsForAttackPatterns(Map.of(ap1, true, ap2, true));

    // set SUCCESS results for all inject expectations
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
    Optional<SecurityCoverageSendJob> job =
        securityCoverageSendJobService.createOrUpdateCoverageSendJobForSimulationIfReady(
            exerciseWrapper.get());

    // intermediate assert
    assertThat(job).isNotEmpty();

    // act
    Bundle bundle = securityCoverageService.createBundleFromSendJobs(List.of(job.get()));

    // assert
    SecurityAssessment generatedAssessment = securityAssessmentComposer.generatedItems.getFirst();
    List<Inject> generatedInjects = injectComposer.generatedItems;
    List<SecurityPlatform> generatedSecurityPlatforms = securityPlatformComposer.generatedItems;
    List<AttackPattern> generatedAttackPatterns = attackPatternComposer.generatedItems;

    DomainObject expectedAssessmentWithCoverage =
        getExpectedMainSecurityCoverage(generatedAssessment, generatedInjects);
    List<DomainObject> expectedPlatformIdentities =
        generatedSecurityPlatforms.stream().map(SecurityPlatform::toStixDomainObject).toList();

    // main assessment is completed with coverage
    assertThatJson(
            bundle.findById(new Identifier(generatedAssessment.getExternalId())).toStix(mapper))
        .whenIgnoringPaths("modified")
        .isEqualTo(expectedAssessmentWithCoverage.toStix(mapper));

    // security platforms are present in bundle as Identities
    for (DomainObject platformSdo : expectedPlatformIdentities) {
      assertThatJson(bundle.findById(platformSdo.getId()).toStix(mapper))
          .isEqualTo(platformSdo.toStix(mapper));

      // security platform SROs
      List<RelationshipObject> actualSros =
          bundle.findRelationshipsByTargetRef(platformSdo.getId());
      assertThat(actualSros.size()).isEqualTo(1);

      RelationshipObject actualSro = actualSros.getFirst();
      RelationshipObject expectedSro =
          new RelationshipObject(
              Map.of(
                  CommonProperties.ID.toString(),
                  new Identifier(ObjectTypes.RELATIONSHIP + "--" + UUID.randomUUID()),
                  CommonProperties.TYPE.toString(),
                  new StixString(ObjectTypes.RELATIONSHIP.toString()),
                  "relationship_type",
                  new StixString("has-assessed"),
                  RelationshipObject.Properties.SOURCE_REF.toString(),
                  expectedAssessmentWithCoverage.getId(),
                  RelationshipObject.Properties.TARGET_REF.toString(),
                  platformSdo.getId(),
                  "covered",
                  new io.openbas.stix.types.Boolean(true),
                  "coverage",
                  toDictionary(
                      Map.of(
                          "PREVENTION",
                          new StixString("1.0"),
                          "DETECTION",
                          new StixString("1.0")))));
      assertThatJson(actualSro.toStix(mapper))
          .whenIgnoringPaths(CommonProperties.ID.toString())
          .isEqualTo(expectedSro.toStix(mapper));
    }

    // attack pattern SROs
    for (StixRefToExternalRef stixRef : generatedAssessment.getAttackPatternRefs()) {
      List<RelationshipObject> actualSros =
          bundle.findRelationshipsByTargetRef(new Identifier(stixRef.getStixRef()));
      assertThat(actualSros.size()).isEqualTo(1);

      RelationshipObject actualSro = actualSros.getFirst();
      RelationshipObject expectedSro =
          new RelationshipObject(
              Map.of(
                  CommonProperties.ID.toString(),
                  new Identifier(ObjectTypes.RELATIONSHIP + "--" + UUID.randomUUID()),
                  CommonProperties.TYPE.toString(),
                  new StixString(ObjectTypes.RELATIONSHIP.toString()),
                  "relationship_type",
                  new StixString("has-assessed"),
                  RelationshipObject.Properties.SOURCE_REF.toString(),
                  expectedAssessmentWithCoverage.getId(),
                  RelationshipObject.Properties.TARGET_REF.toString(),
                  new Identifier(stixRef.getStixRef()),
                  "covered",
                  new io.openbas.stix.types.Boolean(true),
                  "coverage",
                  toDictionary(
                      Map.of(
                          "PREVENTION",
                          new StixString("1.0"),
                          "DETECTION",
                          new StixString("1.0")))));
      assertThatJson(actualSro.toStix(mapper))
          .whenIgnoringPaths(CommonProperties.ID.toString())
          .isEqualTo(expectedSro.toStix(mapper));
    }
  }

  @Test
  @DisplayName(
          "When all attack patterns are covered and half of expectations are successful, bundle is correct")
  public void whenAllAttackPatternsAreCoveredAndHalfOfAllExpectationsAreSuccessful_bundleIsCorrect()
          throws ParsingException, JsonProcessingException {
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
    // create exercise cover all TTPs
    ExerciseComposer.Composer exerciseWrapper =
            createExerciseWrapperWithInjectsForAttackPatterns(Map.of(ap1, true, ap2, true));

    // expectation results
    Inject successfulInject = injectComposer.generatedItems.stream()
            .filter(i -> i.getInjectorContract().get().getAttackPatterns().stream()
                    .anyMatch(ap -> ap.getExternalId().equals("T1234"))).findFirst().get();
    successfulInject.getExpectations().forEach(
            exp ->
                    exp.setResults(
                            List.of(
                                    InjectExpectationResult.builder()
                                            .score(100.0)
                                            .sourceId(securityPlatformWrapper.get().getId())
                                            .sourceName("Unit Tests")
                                            .sourceType("manual")
                                            .build())));

    Inject failedInject = injectComposer.generatedItems.stream()
            .filter(i -> i.getInjectorContract().get().getAttackPatterns().stream()
                    .anyMatch(ap -> ap.getExternalId().equals("T5678"))).findFirst().get();
    failedInject.getExpectations().forEach(
            exp ->
            {
                    exp.setResults(
                            List.of(
                                    InjectExpectationResult.builder()
                                            .score(0.0)
                                            .sourceId(securityPlatformWrapper.get().getId())
                                            .sourceName("Unit Tests")
                                            .sourceType("manual")
                                            .build()));
                    exp.setScore(0.0);
            });

    scenarioComposer
            .forScenario(ScenarioFixture.createDefaultCrisisScenario())
            .withSimulation(exerciseWrapper)
            .persist();
    entityManager.flush();
    entityManager.refresh(exerciseWrapper.get());
    Optional<SecurityCoverageSendJob> job =
            securityCoverageSendJobService.createOrUpdateCoverageSendJobForSimulationIfReady(
                    exerciseWrapper.get());

    // intermediate assert
    assertThat(job).isNotEmpty();

    // act
    Bundle bundle = securityCoverageService.createBundleFromSendJobs(List.of(job.get()));

    // assert
    SecurityAssessment generatedAssessment = securityAssessmentComposer.generatedItems.getFirst();
    List<Inject> generatedInjects = injectComposer.generatedItems;
    List<SecurityPlatform> generatedSecurityPlatforms = securityPlatformComposer.generatedItems;
    List<AttackPattern> generatedAttackPatterns = attackPatternComposer.generatedItems;

    DomainObject expectedAssessmentWithCoverage =
            getExpectedMainSecurityCoverage(generatedAssessment, generatedInjects);
    List<DomainObject> expectedPlatformIdentities =
            generatedSecurityPlatforms.stream().map(SecurityPlatform::toStixDomainObject).toList();

    // main assessment is completed with coverage
    assertThatJson(
            bundle.findById(new Identifier(generatedAssessment.getExternalId())).toStix(mapper))
            .whenIgnoringPaths("modified")
            .isEqualTo(expectedAssessmentWithCoverage.toStix(mapper));

    // security platforms are present in bundle as Identities
    for (DomainObject platformSdo : expectedPlatformIdentities) {
      assertThatJson(bundle.findById(platformSdo.getId()).toStix(mapper))
              .isEqualTo(platformSdo.toStix(mapper));

      // security platform SROs
      List<RelationshipObject> actualSros =
              bundle.findRelationshipsByTargetRef(platformSdo.getId());
      assertThat(actualSros.size()).isEqualTo(1);

      RelationshipObject actualSro = actualSros.getFirst();
      RelationshipObject expectedSro =
              new RelationshipObject(
                      Map.of(
                              CommonProperties.ID.toString(),
                              new Identifier(ObjectTypes.RELATIONSHIP + "--" + UUID.randomUUID()),
                              CommonProperties.TYPE.toString(),
                              new StixString(ObjectTypes.RELATIONSHIP.toString()),
                              "relationship_type",
                              new StixString("has-assessed"),
                              RelationshipObject.Properties.SOURCE_REF.toString(),
                              expectedAssessmentWithCoverage.getId(),
                              RelationshipObject.Properties.TARGET_REF.toString(),
                              platformSdo.getId(),
                              "covered",
                              new io.openbas.stix.types.Boolean(true),
                              "coverage",
                              toDictionary(
                                      Map.of(
                                              "PREVENTION",
                                              new StixString("0.5"),
                                              "DETECTION",
                                              new StixString("0.5")))));
      assertThatJson(actualSro.toStix(mapper))
              .whenIgnoringPaths(CommonProperties.ID.toString())
              .isEqualTo(expectedSro.toStix(mapper));
    }

    // attack pattern SROs
    for (StixRefToExternalRef stixRef : generatedAssessment.getAttackPatternRefs()) {
      List<RelationshipObject> actualSros =
              bundle.findRelationshipsByTargetRef(new Identifier(stixRef.getStixRef()));
      assertThat(actualSros.size()).isEqualTo(1);

      RelationshipObject actualSro = actualSros.getFirst();
      RelationshipObject expectedSro =
              new RelationshipObject(
                      Map.of(
                              CommonProperties.ID.toString(),
                              new Identifier(ObjectTypes.RELATIONSHIP + "--" + UUID.randomUUID()),
                              CommonProperties.TYPE.toString(),
                              new StixString(ObjectTypes.RELATIONSHIP.toString()),
                              "relationship_type",
                              new StixString("has-assessed"),
                              RelationshipObject.Properties.SOURCE_REF.toString(),
                              expectedAssessmentWithCoverage.getId(),
                              RelationshipObject.Properties.TARGET_REF.toString(),
                              new Identifier(stixRef.getStixRef()),
                              "covered",
                              new io.openbas.stix.types.Boolean(true),
                              "coverage",
                              toDictionary(
                                      Map.of(
                                              "PREVENTION",
                                              new StixString(stixRef.getExternalRef().equals("T1234") ? "1.0" : "0.0"),
                                              "DETECTION",
                                              new StixString(stixRef.getExternalRef().equals("T1234") ? "1.0" : "0.0")))));
      assertThatJson(actualSro.toStix(mapper))
              .whenIgnoringPaths(CommonProperties.ID.toString())
              .isEqualTo(expectedSro.toStix(mapper));
    }
  }

  @Test
  @DisplayName(
          "When there is a following simulation, set SRO times accordingly")
  public void whenThereIsAFollwingSimulation_setSROTimesAccordingly()
          throws ParsingException, JsonProcessingException {
    AttackPatternComposer.Composer ap1 =
            attackPatternComposer.forAttackPattern(
                    AttackPatternFixture.createAttackPatternsWithExternalId("T1234"));
    SecurityPlatformComposer.Composer securityPlatformWrapper =
            securityPlatformComposer
                    .forSecurityPlatform(SecurityPlatformFixture.createDefaultEDR())
                    .persist();
    // create exercise cover all TTPs
    ExerciseComposer.Composer exerciseWrapper =
            createExerciseWrapperWithInjectsForAttackPatterns(Map.of(ap1, true));

    // set SUCCESS results for all inject expectations
    Inject successfulInject = injectComposer.generatedItems.stream()
            .filter(i -> i.getInjectorContract().get().getAttackPatterns().stream()
                    .anyMatch(ap -> ap.getExternalId().equals("T1234"))).findFirst().get();
    successfulInject.getExpectations().forEach(
            exp ->
                    exp.setResults(
                            List.of(
                                    InjectExpectationResult.builder()
                                            .score(100.0)
                                            .sourceId(securityPlatformWrapper.get().getId())
                                            .sourceName("Unit Tests")
                                            .sourceType("manual")
                                            .build())));
    // start the exercise
    Instant sroStartTime = Instant.parse("2003-02-15T09:45:02Z");
    exerciseWrapper.get().setStart(sroStartTime);

    // persist
    ScenarioComposer.Composer scenarioWrapper = scenarioComposer
            .forScenario(ScenarioFixture.createDefaultCrisisScenario())
            .withSimulation(exerciseWrapper)
            .persist();
    entityManager.flush();

    //persist other simulation of same scenario
    Instant sroStopTime = Instant.parse("2004-06-26T12:34:56Z");
    Exercise newExercise = ExerciseFixture.createDefaultExercise();
    newExercise.setStart(sroStopTime);
    scenarioWrapper.withSimulation(exerciseComposer.forExercise(newExercise)).persist();

    entityManager.refresh(exerciseWrapper.get());
    Optional<SecurityCoverageSendJob> job =
            securityCoverageSendJobService.createOrUpdateCoverageSendJobForSimulationIfReady(
                    exerciseWrapper.get());

    // intermediate assert
    assertThat(job).isNotEmpty();

    // act
    Bundle bundle = securityCoverageService.createBundleFromSendJobs(List.of(job.get()));

    // assert
    SecurityAssessment generatedAssessment = securityAssessmentComposer.generatedItems.getFirst();
    List<Inject> generatedInjects = injectComposer.generatedItems;
    List<SecurityPlatform> generatedSecurityPlatforms = securityPlatformComposer.generatedItems;
    List<AttackPattern> generatedAttackPatterns = attackPatternComposer.generatedItems;

    DomainObject expectedAssessmentWithCoverage =
            getExpectedMainSecurityCoverage(generatedAssessment, generatedInjects);
    List<DomainObject> expectedPlatformIdentities =
            generatedSecurityPlatforms.stream().map(SecurityPlatform::toStixDomainObject).toList();

    // main assessment is completed with coverage
    assertThatJson(
            bundle.findById(new Identifier(generatedAssessment.getExternalId())).toStix(mapper))
            .whenIgnoringPaths("modified")
            .isEqualTo(expectedAssessmentWithCoverage.toStix(mapper));

    // security platforms are present in bundle as Identities
    for (DomainObject platformSdo : expectedPlatformIdentities) {
      assertThatJson(bundle.findById(platformSdo.getId()).toStix(mapper))
              .isEqualTo(platformSdo.toStix(mapper));

      // security platform SROs
      List<RelationshipObject> actualSros =
              bundle.findRelationshipsByTargetRef(platformSdo.getId());
      assertThat(actualSros.size()).isEqualTo(1);

      RelationshipObject actualSro = actualSros.getFirst();
      RelationshipObject expectedSro =
              new RelationshipObject(
                      Map.of(
                              CommonProperties.ID.toString(),
                              new Identifier(ObjectTypes.RELATIONSHIP + "--" + UUID.randomUUID()),
                              CommonProperties.TYPE.toString(),
                              new StixString(ObjectTypes.RELATIONSHIP.toString()),
                              "relationship_type",
                              new StixString("has-assessed"),
                              RelationshipObject.Properties.SOURCE_REF.toString(),
                              expectedAssessmentWithCoverage.getId(),
                              RelationshipObject.Properties.TARGET_REF.toString(),
                              platformSdo.getId(),
                              "covered",
                              new io.openbas.stix.types.Boolean(true),
                              "coverage",
                              toDictionary(
                                      Map.of(
                                              "PREVENTION",
                                              new StixString("0.5"),
                                              "DETECTION",
                                              new StixString("0.5")))));
      assertThatJson(actualSro.toStix(mapper))
              .whenIgnoringPaths(CommonProperties.ID.toString())
              .isEqualTo(expectedSro.toStix(mapper));
    }

    // attack pattern SROs
    for (StixRefToExternalRef stixRef : generatedAssessment.getAttackPatternRefs()) {
      List<RelationshipObject> actualSros =
              bundle.findRelationshipsByTargetRef(new Identifier(stixRef.getStixRef()));
      assertThat(actualSros.size()).isEqualTo(1);

      RelationshipObject actualSro = actualSros.getFirst();
      RelationshipObject expectedSro =
              new RelationshipObject(
                      Map.of(
                              CommonProperties.ID.toString(),
                              new Identifier(ObjectTypes.RELATIONSHIP + "--" + UUID.randomUUID()),
                              CommonProperties.TYPE.toString(),
                              new StixString(ObjectTypes.RELATIONSHIP.toString()),
                              "relationship_type",
                              new StixString("has-assessed"),
                              RelationshipObject.Properties.SOURCE_REF.toString(),
                              expectedAssessmentWithCoverage.getId(),
                              RelationshipObject.Properties.TARGET_REF.toString(),
                              new Identifier(stixRef.getStixRef()),
                              "covered",
                              new io.openbas.stix.types.Boolean(true),
                              "coverage",
                              toDictionary(
                                      Map.of(
                                              "PREVENTION",
                                              new StixString(stixRef.getExternalRef().equals("T1234") ? "1.0" : "0.0"),
                                              "DETECTION",
                                              new StixString(stixRef.getExternalRef().equals("T1234") ? "1.0" : "0.0")))));
      assertThatJson(actualSro.toStix(mapper))
              .whenIgnoringPaths(CommonProperties.ID.toString())
              .isEqualTo(expectedSro.toStix(mapper));
    }
  }
}
