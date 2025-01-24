package io.openbas.rest.inject_expectation;

import static org.junit.jupiter.api.Assertions.assertEquals;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.fixtures.*;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(MockitoExtension.class)
public class InjectExpectationServiceTest extends IntegrationTest {

  @Autowired private InjectExpectationRepository injectExpectationRepository;

  @Autowired private InjectorContractRepository injectorContractRepository;

  @Autowired private InjectorRepository injectorRepository;

  @Autowired private InjectRepository injectRepository;

  @Autowired private AssetRepository assetRepository;

  @Autowired private AssetGroupRepository assetGroupRepository;

  @Autowired private AgentRepository agentRepository;

  @Autowired private InjectExpectationService injectExpectationService;

  private static Injector SAVEDINJECTOR;
  private static InjectorContract SAVEDINJECTORCONTRACT;
  private static Asset ASSET;
  private static Asset SAVEDASSET;

  @BeforeAll
  void beforeAll() {
    InjectorContract injectorContract =
        InjectorContractFixture.createInjectorContract(
            "84b3b140-6b7d-47d9-9b61-8fa05882fc7e",
            Map.of("en", "AMSI Bypass - AMSI InitFailed"),
            "{\"label\": {\"en\": \"AMSI Bypass - AMSI InitFailed\", \"fr\": \"AMSI Bypass - AMSI InitFailed\"}, \"config\": {\"type\": \"openbas_implant\", \"label\": {\"en\": \"OpenBAS Implant\", \"fr\": \"OpenBAS Implant\"}, \"expose\": true, \"color_dark\": \"#000000\", \"color_light\": \"#000000\"}, \"fields\": [{\"key\": \"assets\", \"type\": \"asset\", \"label\": \"Assets\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": [\"assets\", \"assetgroups\"]}, {\"key\": \"assetgroups\", \"type\": \"asset-group\", \"label\": \"Asset groups\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": [\"assets\", \"assetgroups\"]}, {\"key\": \"expectations\", \"type\": \"expectation\", \"label\": \"Expectations\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": null, \"predefinedExpectations\": [{\"expectation_name\": \"Expect inject to be prevented\", \"expectation_type\": \"PREVENTION\", \"expectation_score\": 100.0, \"expectation_description\": null, \"expectation_expiration_time\": 21600, \"expectation_expectation_group\": false}, {\"expectation_name\": \"Expect inject to be detected\", \"expectation_type\": \"DETECTION\", \"expectation_score\": 100.0, \"expectation_description\": null, \"expectation_expiration_time\": 21600, \"expectation_expectation_group\": false}]}, {\"key\": \"obfuscator\", \"type\": \"choice\", \"label\": \"Obfuscator\", \"choices\": [{\"label\": \"base64\", \"value\": \"base64\", \"information\": \"CMD does not support base64 obfuscation\"}, {\"label\": \"plain-text\", \"value\": \"plain-text\", \"information\": \"\"}], \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"1\", \"defaultValue\": [\"plain-text\"], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": null}], \"manual\": false, \"context\": {}, \"platforms\": [\"Windows\"], \"variables\": [{\"key\": \"user\", \"type\": \"String\", \"label\": \"User that will receive the injection\", \"children\": [{\"key\": \"user.id\", \"type\": \"String\", \"label\": \"Id of the user in the platform\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.email\", \"type\": \"String\", \"label\": \"Email of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.firstname\", \"type\": \"String\", \"label\": \"First name of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.lastname\", \"type\": \"String\", \"label\": \"Last name of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.lang\", \"type\": \"String\", \"label\": \"Language of the user\", \"children\": [], \"cardinality\": \"1\"}], \"cardinality\": \"1\"}, {\"key\": \"exercise\", \"type\": \"Object\", \"label\": \"Exercise of the current injection\", \"children\": [{\"key\": \"exercise.id\", \"type\": \"String\", \"label\": \"Id of the user in the platform\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"exercise.name\", \"type\": \"String\", \"label\": \"Name of the exercise\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"exercise.description\", \"type\": \"String\", \"label\": \"Description of the exercise\", \"children\": [], \"cardinality\": \"1\"}], \"cardinality\": \"1\"}, {\"key\": \"teams\", \"type\": \"String\", \"label\": \"List of team name for the injection\", \"children\": [], \"cardinality\": \"n\"}, {\"key\": \"player_uri\", \"type\": \"String\", \"label\": \"Player interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"challenges_uri\", \"type\": \"String\", \"label\": \"Challenges interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"scoreboard_uri\", \"type\": \"String\", \"label\": \"Scoreboard interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"lessons_uri\", \"type\": \"String\", \"label\": \"Lessons learned interface platform link\", \"children\": [], \"cardinality\": \"1\"}], \"contract_id\": \"84b3b140-6b7d-47d9-9b61-8fa05882fc7e\", \"needs_executor\": true, \"is_atomic_testing\": true, \"contract_attack_patterns_external_ids\": []}");
    ASSET = AssetFixture.createDefaultAsset("asset name");
    SAVEDINJECTOR =
        this.injectorRepository.save(
            InjectorFixture.createInjector(
                "49229430-b5b5-431f-ba5b-f36f599b0144", "OpenBAS Implant", "openbas_implant"));
    injectorContract.setInjector(SAVEDINJECTOR);
    SAVEDINJECTORCONTRACT = this.injectorContractRepository.save(injectorContract);
    SAVEDASSET = this.assetRepository.save(ASSET);
  }

  @AfterAll
  void afterAll() {
    assetRepository.delete(SAVEDASSET);
    injectorContractRepository.delete(SAVEDINJECTORCONTRACT);
    injectorRepository.delete(SAVEDINJECTOR);
  }

  @AfterEach
  void afterEach() {
    injectExpectationRepository.deleteAll();
  }

  @Test
  @DisplayName(
      "Given an atomic testing with an asset linked to an agent its expectations must be created")
  void given_an_atomic_testing_with_an_asset_linked_to_an_agent_expectations_must_be_saved()
      throws Exception {
    // -- PREPARE --
    Agent agent = AgentFixture.createAgent(ASSET, "external01");
    agent.setLastSeen(Instant.now());
    Agent savedAgent = this.agentRepository.save(agent);
    Inject inject =
        InjectFixture.createTechnicalInject(
            SAVEDINJECTORCONTRACT, "AMSI Bypass - AMSI InitFailed", SAVEDASSET);
    Inject savedInject = this.injectRepository.save(inject);
    ExecutableInject executableInject =
        new ExecutableInject(
            false, true, savedInject, Collections.emptyList(), List.of(ASSET), null, null);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectation(ASSET);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectation(ASSET);

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject, List.of(preventionExpectation, detectionExpectation));

    // -- ASSERT --
    assertEquals(4, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAsset(savedInject.getId(), SAVEDASSET.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAgent(savedInject.getId(), savedAgent.getId())
            .size());

    // -- THEN--
    agentRepository.delete(savedAgent);
    injectRepository.delete(savedInject);
  }

  @Test
  @DisplayName(
      "Given an atomic testing with an asset with no agent its expectations must be created")
  void given_an_atomic_testing_with_an_asset_with_no_agent_expectations_must_be_saved()
      throws Exception {
    // -- PREPARE --
    Inject inject =
        InjectFixture.createTechnicalInject(
            SAVEDINJECTORCONTRACT, "AMSI Bypass - AMSI InitFailed", SAVEDASSET);
    Inject savedInject = this.injectRepository.save(inject);
    ExecutableInject executableInject =
        new ExecutableInject(
            false, true, savedInject, Collections.emptyList(), List.of(ASSET), null, null);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectation(ASSET);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectation(ASSET);

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject, List.of(preventionExpectation, detectionExpectation));

    // -- ASSERT --
    assertEquals(2, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAsset(savedInject.getId(), SAVEDASSET.getId())
            .size());

    // -- THEN --
    injectRepository.delete(savedInject);
  }

  @Test
  @DisplayName(
      "Given an atomic testing with an assetGroup and an agent its expectations must be created")
  void given_an_atomic_testing_with_an_assetGroup_and_an_agent_expectations_must_be_saved()
      throws Exception {
    // -- PREPARE --
    Agent agent = AgentFixture.createAgent(ASSET, "external01");
    agent.setLastSeen(Instant.now());
    Agent savedAgent = this.agentRepository.save(agent);
    AssetGroup assetGroup =
        AssetGroupFixture.createAssetGroupWithAssets("asset group name", List.of(SAVEDASSET));
    AssetGroup savedAssetGroup = assetGroupRepository.save(assetGroup);
    Inject inject =
        InjectFixture.createTechnicalInjectWithAssetGroup(
            SAVEDINJECTORCONTRACT, "AMSI Bypass - AMSI InitFailed", savedAssetGroup);
    Inject savedInject = this.injectRepository.save(inject);
    ExecutableInject executableInject =
        new ExecutableInject(
            false,
            true,
            savedInject,
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(assetGroup),
            null);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createDetectionExpectationForAssetGroup(assetGroup);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createPreventionExpectationForAssetGroup(assetGroup);
    DetectionExpectation detectionExpectationAsset =
        ExpectationFixture.createDetectionExpectationAssetForAssetGroup(ASSET);
    PreventionExpectation preventionExpectationAsset =
        ExpectationFixture.createPreventionExpectationAssetForAssetGroup(ASSET);

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            preventionExpectation,
            detectionExpectation,
            preventionExpectationAsset,
            detectionExpectationAsset));

    // -- ASSERT --
    assertEquals(6, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAsset(savedInject.getId(), SAVEDASSET.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAgent(savedInject.getId(), savedAgent.getId())
            .size());

    // -- THEN --
    agentRepository.delete(savedAgent);
    injectRepository.delete(savedInject);
    assetGroupRepository.delete(savedAssetGroup);
  }

  @Test
  @DisplayName(
      "Given an atomic testing with an assetGroup and no agent its expectations must be created")
  void given_an_atomic_testing_with_an_assetGroup_and_no_agent_expectations_must_be_saved()
      throws Exception {
    // -- PREPARE --
    AssetGroup assetGroup =
        AssetGroupFixture.createAssetGroupWithAssets("asset group name", List.of(SAVEDASSET));
    AssetGroup savedAssetGroup = assetGroupRepository.save(assetGroup);
    Inject inject =
        InjectFixture.createTechnicalInjectWithAssetGroup(
            SAVEDINJECTORCONTRACT, "AMSI Bypass - AMSI InitFailed", savedAssetGroup);
    Inject savedInject = this.injectRepository.save(inject);
    ExecutableInject executableInject =
        new ExecutableInject(
            false,
            true,
            savedInject,
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(assetGroup),
            null);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createDetectionExpectationForAssetGroup(assetGroup);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createPreventionExpectationForAssetGroup(assetGroup);
    DetectionExpectation detectionExpectationAsset =
        ExpectationFixture.createDetectionExpectationAssetForAssetGroup(ASSET);
    PreventionExpectation preventionExpectationAsset =
        ExpectationFixture.createPreventionExpectationAssetForAssetGroup(ASSET);

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            preventionExpectation,
            detectionExpectation,
            detectionExpectationAsset,
            preventionExpectationAsset));

    // -- ASSERT --
    assertEquals(4, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAsset(savedInject.getId(), SAVEDASSET.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
            .size());

    // -- THEN --
    injectRepository.delete(savedInject);
    assetGroupRepository.delete(savedAssetGroup);
  }

  @Test
  @DisplayName(
      "Given an atomic testing with an asset with two agents its expectations must be created")
  void given_an_atomic_testing_with_an_asset_with_two_agents_expectations_must_be_saved()
      throws Exception {
    // -- PREPARE --
    Agent agent = AgentFixture.createAgent(ASSET, "external01");
    agent.setLastSeen(Instant.now());
    Agent savedAgent = this.agentRepository.save(agent);
    Agent agent1 = AgentFixture.createAgent(ASSET, "external02");
    agent1.setLastSeen(Instant.now());
    Agent savedAgent1 = this.agentRepository.save(agent1);
    Inject inject =
        InjectFixture.createTechnicalInject(
            SAVEDINJECTORCONTRACT, "AMSI Bypass - AMSI InitFailed", SAVEDASSET);
    Inject savedInject = this.injectRepository.save(inject);
    ExecutableInject executableInject =
        new ExecutableInject(
            false, true, savedInject, Collections.emptyList(), List.of(ASSET), null, null);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectation(ASSET);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectation(ASSET);

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject, List.of(preventionExpectation, detectionExpectation));

    // -- ASSERT --
    assertEquals(6, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAsset(savedInject.getId(), SAVEDASSET.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAgent(savedInject.getId(), savedAgent.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAgent(savedInject.getId(), savedAgent1.getId())
            .size());

    // -- THEN--
    agentRepository.delete(savedAgent);
    agentRepository.delete(savedAgent1);
    injectRepository.delete(savedInject);
  }

  @Test
  @DisplayName(
      "Given an atomic testing with an assetGroup and two agents its expectations must be created")
  void given_an_atomic_testing_with_an_assetGroup_and_two_agents_expectations_must_be_saved()
      throws Exception {
    // -- PREPARE --
    Agent agent = AgentFixture.createAgent(ASSET, "external01");
    agent.setLastSeen(Instant.now());
    Agent savedAgent = this.agentRepository.save(agent);
    Agent agent1 = AgentFixture.createAgent(ASSET, "external02");
    agent1.setLastSeen(Instant.now());
    Agent savedAgent1 = this.agentRepository.save(agent1);
    AssetGroup assetGroup =
        AssetGroupFixture.createAssetGroupWithAssets("asset group name", List.of(SAVEDASSET));
    AssetGroup savedAssetGroup = assetGroupRepository.save(assetGroup);
    Inject inject =
        InjectFixture.createTechnicalInjectWithAssetGroup(
            SAVEDINJECTORCONTRACT, "AMSI Bypass - AMSI InitFailed", savedAssetGroup);
    Inject savedInject = this.injectRepository.save(inject);
    ExecutableInject executableInject =
        new ExecutableInject(
            false,
            true,
            savedInject,
            Collections.emptyList(),
            Collections.emptyList(),
            List.of(assetGroup),
            null);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createDetectionExpectationForAssetGroup(assetGroup);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createPreventionExpectationForAssetGroup(assetGroup);
    DetectionExpectation detectionExpectationAsset =
        ExpectationFixture.createDetectionExpectationAssetForAssetGroup(ASSET);
    PreventionExpectation preventionExpectationAsset =
        ExpectationFixture.createPreventionExpectationAssetForAssetGroup(ASSET);

    // -- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            preventionExpectation,
            detectionExpectation,
            preventionExpectationAsset,
            detectionExpectationAsset));

    // -- ASSERT --
    assertEquals(8, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAsset(savedInject.getId(), SAVEDASSET.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAgent(savedInject.getId(), savedAgent.getId())
            .size());
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAgent(savedInject.getId(), savedAgent1.getId())
            .size());

    // -- THEN --
    agentRepository.delete(savedAgent);
    agentRepository.delete(savedAgent1);
    injectRepository.delete(savedInject);
    assetGroupRepository.delete(savedAssetGroup);
  }
}
