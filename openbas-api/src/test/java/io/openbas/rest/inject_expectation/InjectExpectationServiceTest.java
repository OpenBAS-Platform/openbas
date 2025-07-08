package io.openbas.rest.inject_expectation;

import static io.openbas.collectors.expectations_expiration_manager.utils.ExpectationUtils.PREVENTED;
import static io.openbas.injectors.openbas.OpenBASInjector.OPENBAS_INJECTOR_ID;
import static io.openbas.injectors.openbas.OpenBASInjector.OPENBAS_INJECTOR_NAME;
import static java.util.Collections.emptyList;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.expectation.ExpectationType;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.AgentComposer;
import io.openbas.utils.fixtures.composers.EndpointComposer;
import io.openbas.utils.fixtures.composers.InjectComposer;
import io.openbas.utils.fixtures.composers.InjectExpectationComposer;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(MockitoExtension.class)
class InjectExpectationServiceTest extends IntegrationTest {

  private static final String INJECTION_NAME = "AMSI Bypass - AMSI InitFailed";
  private static final String INJECTOR_TYPE = "openbas_implant";
  static Long EXPIRATION_TIME_SIX_HOURS = 21600L;

  // Saved entities for test setup
  @Autowired private InjectComposer injectComposer;
  @Autowired private InjectExpectationComposer injectExpectationComposer;
  @Autowired private AgentComposer agentComposer;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private EntityManager entityManager;

  @Autowired private InjectExpectationRepository injectExpectationRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private InjectorRepository injectorRepository;
  @Autowired private InjectRepository injectRepository;
  @Autowired private AssetRepository assetRepository;
  @Autowired private AssetGroupRepository assetGroupRepository;
  @Autowired private AgentRepository agentRepository;

  @Autowired private InjectExpectationService injectExpectationService;

  private static Injector savedInjector;
  private static InjectorContract savedInjectorContract;
  private static Asset savedAsset;

  @BeforeAll
  void beforeAll() throws JsonProcessingException {
    InjectorContract injectorContract =
        InjectorContractFixture.createInjectorContract(Map.of("en", INJECTION_NAME));
    savedInjector =
        injectorRepository.save(
            InjectorFixture.createInjector(
                OPENBAS_INJECTOR_ID, OPENBAS_INJECTOR_NAME, INJECTOR_TYPE));
    injectorContract.setInjector(savedInjector);

    savedInjectorContract = injectorContractRepository.save(injectorContract);
    savedAsset = assetRepository.save(AssetFixture.createDefaultAsset("asset name"));
  }

  @AfterAll
  void afterAll() {
    assetRepository.deleteAll();
    injectorContractRepository.delete(savedInjectorContract);
  }

  @AfterEach
  void afterEach() {
    injectExpectationRepository.deleteAll();
    injectRepository.deleteAll();
    assetGroupRepository.deleteAll();
    agentRepository.deleteAll();
  }

  private Inject saveInject(InjectorContract injectorContract) {
    Inject inject =
        InjectFixture.createTechnicalInject(injectorContract, INJECTION_NAME, savedAsset);
    return injectRepository.save(inject);
  }

  private ExecutableInject createExecutableInject(
      Inject savedInject, List<AssetGroup> assetGroups) {
    return new ExecutableInject(
        false, true, savedInject, emptyList(), List.of(savedAsset), assetGroups, emptyList());
  }

  private Agent createAgent(String external01) {
    Agent agent = AgentFixture.createAgent(savedAsset, external01);
    return this.agentRepository.save(agent);
  }

  private AssetGroup createAssetGroup(String name) {
    AssetGroup assetGroup = AssetGroupFixture.createAssetGroupWithAssets(name, List.of(savedAsset));
    return assetGroupRepository.save(assetGroup);
  }

  @Test
  @DisplayName(
      "Expectations type prevention and detection should be created for agent linked to asset")
  void expectationsForAssetLinkedToAgent() {
    // -- PREPARE --
    Agent savedAgent = createAgent("external01");
    Inject savedInject = saveInject(savedInjectorContract);
    ExecutableInject executableInject = createExecutableInject(savedInject, emptyList());
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectationForAsset(
            savedAsset, null, EXPIRATION_TIME_SIX_HOURS);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectationForAsset(
            savedAsset, null, EXPIRATION_TIME_SIX_HOURS);
    DetectionExpectation detectionExpectationAgent =
        ExpectationFixture.createTechnicalDetectionExpectation(
            savedAgent, savedAsset, null, EXPIRATION_TIME_SIX_HOURS, emptyList());
    PreventionExpectation preventionExpectationAgent =
        ExpectationFixture.createTechnicalPreventionExpectation(
            savedAgent, savedAsset, null, EXPIRATION_TIME_SIX_HOURS, emptyList());

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            preventionExpectation,
            detectionExpectation,
            preventionExpectationAgent,
            detectionExpectationAgent));

    // -- ASSERT --
    assertEquals(4, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAsset(savedInject.getId(), null, savedAsset.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(savedInject.getId(), null, savedAgent.getId())
            .size());
  }

  @Test
  @DisplayName(
      "Expectations should be created for agent linked to asset who is part of an asset group")
  void expectationsForAssetGroupLinkedToAgent() {
    // -- PREPARE --
    Agent savedAgent = createAgent("external01");
    AssetGroup savedAssetGroup = createAssetGroup("asset group name");
    Inject savedInject = saveInject(savedInjectorContract);
    ExecutableInject executableInject =
        createExecutableInject(savedInject, List.of(savedAssetGroup));
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createDetectionExpectationForAssetGroup(
            savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createPreventionExpectationForAssetGroup(
            savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    DetectionExpectation detectionExpectationAsset =
        ExpectationFixture.createTechnicalDetectionExpectationForAsset(
            savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    PreventionExpectation preventionExpectationAsset =
        ExpectationFixture.createTechnicalPreventionExpectationForAsset(
            savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    DetectionExpectation detectionExpectationAgent =
        ExpectationFixture.createTechnicalDetectionExpectation(
            savedAgent, savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS, emptyList());
    PreventionExpectation preventionExpectationAgent =
        ExpectationFixture.createTechnicalPreventionExpectation(
            savedAgent, savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS, emptyList());

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            preventionExpectation,
            detectionExpectation,
            preventionExpectationAsset,
            detectionExpectationAsset,
            preventionExpectationAgent,
            detectionExpectationAgent));

    // -- ASSERT --
    assertEquals(6, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAsset(
                savedInject.getId(), savedAssetGroup.getId(), savedAsset.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(
                savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
            .size());
  }

  @Test
  @DisplayName("Expectations should be created for asset with multiple agents")
  void expectationsForAssetWithMultipleAgents() {
    // -- PREPARE --
    Agent savedAgent = createAgent("external01");
    Agent savedAgent1 = createAgent("external02");
    Inject savedInject = saveInject(savedInjectorContract);
    ExecutableInject executableInject = createExecutableInject(savedInject, emptyList());
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectationForAsset(
            savedAsset, null, EXPIRATION_TIME_SIX_HOURS);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectationForAsset(
            savedAsset, null, EXPIRATION_TIME_SIX_HOURS);
    DetectionExpectation detectionExpectationAgent =
        ExpectationFixture.createTechnicalDetectionExpectation(
            savedAgent, savedAsset, null, EXPIRATION_TIME_SIX_HOURS, emptyList());
    PreventionExpectation preventionExpectationAgent =
        ExpectationFixture.createTechnicalPreventionExpectation(
            savedAgent, savedAsset, null, EXPIRATION_TIME_SIX_HOURS, emptyList());
    DetectionExpectation detectionExpectationAgent1 =
        ExpectationFixture.createTechnicalDetectionExpectation(
            savedAgent1, savedAsset, null, EXPIRATION_TIME_SIX_HOURS, emptyList());
    PreventionExpectation preventionExpectationAgent1 =
        ExpectationFixture.createTechnicalPreventionExpectation(
            savedAgent1, savedAsset, null, EXPIRATION_TIME_SIX_HOURS, emptyList());

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            preventionExpectation,
            detectionExpectation,
            preventionExpectationAgent,
            detectionExpectationAgent,
            preventionExpectationAgent1,
            detectionExpectationAgent1));

    // -- ASSERT --
    assertEquals(6, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAsset(savedInject.getId(), null, savedAsset.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(savedInject.getId(), null, savedAgent.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(savedInject.getId(), null, savedAgent1.getId())
            .size());
  }

  @Test
  @DisplayName("Expectations should be created for asset group with multiple agents")
  void expectationsForAssetGroupWithMultipleAgents() {
    // -- PREPARE --
    Agent savedAgent = createAgent("external01");
    Agent savedAgent1 = createAgent("external02");
    AssetGroup savedAssetGroup = createAssetGroup("assetGroup name");
    Inject savedInject = saveInject(savedInjectorContract);
    ExecutableInject executableInject =
        createExecutableInject(savedInject, List.of(savedAssetGroup));
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createDetectionExpectationForAssetGroup(
            savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createPreventionExpectationForAssetGroup(
            savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    DetectionExpectation detectionExpectationAsset =
        ExpectationFixture.createTechnicalDetectionExpectationForAsset(
            savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    PreventionExpectation preventionExpectationAsset =
        ExpectationFixture.createTechnicalPreventionExpectationForAsset(
            savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS);
    DetectionExpectation detectionExpectationAgent =
        ExpectationFixture.createTechnicalDetectionExpectation(
            savedAgent, savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS, emptyList());
    PreventionExpectation preventionExpectationAgent =
        ExpectationFixture.createTechnicalPreventionExpectation(
            savedAgent, savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS, emptyList());
    DetectionExpectation detectionExpectationAgent1 =
        ExpectationFixture.createTechnicalDetectionExpectation(
            savedAgent1, savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS, emptyList());
    PreventionExpectation preventionExpectationAgent1 =
        ExpectationFixture.createTechnicalPreventionExpectation(
            savedAgent1, savedAsset, savedAssetGroup, EXPIRATION_TIME_SIX_HOURS, emptyList());

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            preventionExpectation,
            detectionExpectation,
            preventionExpectationAsset,
            detectionExpectationAsset,
            preventionExpectationAgent,
            detectionExpectationAgent,
            preventionExpectationAgent1,
            detectionExpectationAgent1));

    // -- ASSERT --
    assertEquals(8, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAsset(
                savedInject.getId(), savedAssetGroup.getId(), savedAsset.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(
                savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(
                savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
            .size());
  }

  @Transactional
  @Nested
  @DisplayName("Verify Result label for InjectExpectation at asset level")
  class ResultLabelInjectExpectation {

    @Test
    @DisplayName("InjectExpectation Asset should be Prevented")
    void
        given_expectation_agent_prevented_when_compute_asset_expectation_then_asset_expectation_should_be_prevented() {
      assertAssetExpectationResult(
          InjectExpectation.EXPECTATION_TYPE.PREVENTION,
          InjectExpectation.EXPECTATION_STATUS.PENDING,
          InjectExpectation.EXPECTATION_STATUS.SUCCESS,
          PREVENTED,
          100D);
    }

    @Test
    @DisplayName("InjectExpectation Asset should be Not Detected")
    void
        given_expectation_agent_not_detected_when_compute_asset_expectation_then_asset_expectation_should_be_not_detected() {
      assertAssetExpectationResult(
          InjectExpectation.EXPECTATION_TYPE.DETECTION,
          InjectExpectation.EXPECTATION_STATUS.PENDING,
          InjectExpectation.EXPECTATION_STATUS.FAILED,
          ExpectationType.DETECTION.failureLabel,
          0D);
    }

    private void assertAssetExpectationResult(
        InjectExpectation.EXPECTATION_TYPE expectationType,
        InjectExpectation.EXPECTATION_STATUS assetStatus,
        InjectExpectation.EXPECTATION_STATUS agentStatus,
        String expectedResult,
        Double score) {
      AgentComposer.Composer agent =
          agentComposer.forAgent(AgentFixture.createDefaultAgentService());
      EndpointComposer.Composer endpoint =
          endpointComposer.forEndpoint(EndpointFixture.createEndpoint()).withAgent(agent);

      InjectExpectation assetExpectation =
          InjectExpectationFixture.createExpectationWithTypeAndStatus(expectationType, assetStatus);

      InjectExpectation agentExpectation =
          InjectExpectationFixture.createExpectationWithTypeAndStatus(expectationType, agentStatus);

      agentExpectation.setResults(
          List.of(
              InjectExpectationResult.builder()
                  .sourceType("sourceType")
                  .sourceName("sourceName")
                  .sourceId("sourceId")
                  .score(score)
                  .result(expectedResult)
                  .build()));

      Inject inject =
          injectComposer
              .forInject(InjectFixture.getDefaultInject())
              .withEndpoint(endpoint)
              .withExpectation(
                  injectExpectationComposer
                      .forExpectation(agentExpectation)
                      .withAgent(agent)
                      .withEndpoint(endpoint))
              .withExpectation(
                  injectExpectationComposer.forExpectation(assetExpectation).withEndpoint(endpoint))
              .persist()
              .get();

      entityManager.flush();
      entityManager.clear();

      injectExpectationService.computeExpectationAsset(
          assetExpectation, List.of(agentExpectation), "sourceId", "sourceType", "sourceName");

      List<InjectExpectation> savedExpectations =
          injectExpectationRepository.findAllByInjectAndAsset(
              inject.getId(), endpoint.get().getId());

      assertEquals(
          expectedResult,
          savedExpectations.get(0).getResults().get(0).getResult(),
          "Asset expectation result should match expected");
    }
  }
}
