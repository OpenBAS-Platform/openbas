package io.openbas.rest.inject_expectation;

import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.injector_contract.Contract;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.service.AgentService;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.fixtures.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;


@ExtendWith(MockitoExtension.class)
public class InjectExpectationServiceTest extends IntegrationTest {

  @Autowired
  private InjectExpectationRepository injectExpectationRepository;

  @Autowired
  private InjectorContractRepository injectorContractRepository;

  @Autowired
  private InjectorRepository injectorRepository;

  @Autowired
  private InjectRepository injectRepository;

  @Autowired
  private AssetRepository assetRepository;

  @Autowired
  private AgentRepository agentRepository;

  @Autowired
  private InjectExpectationService injectExpectationService;

  @BeforeEach
  void beforeEach() {
  }

  @AfterEach
  void afterEach() {
  }


  @Test
  @DisplayName("Given an atomic testing its expectations must be created")
  void given_an_atomic_testing_expectations_must_be_saved() throws Exception {
    //-- PREPARE --
    Injector injector = new Injector();
    injector.setId("49229430-b5b5-431f-ba5b-f36f599b0144");
    injector.setName("OpenBAS Implant");
    injector.setType("openbas_implant");
    injector.setExternal(false);
    injector.setCreatedAt(Instant.now());
    injector.setUpdatedAt(Instant.now());
    Injector savedInjector = this.injectorRepository.save(injector);
    InjectorContract injectorContract = new InjectorContract();
    injectorContract.setAtomicTesting(true);
    injectorContract.setId("84b3b140-6b7d-47d9-9b61-8fa05882fc7e");
    injectorContract.setContent(
        "{\"label\": {\"en\": \"AMSI Bypass - AMSI InitFailed\", \"fr\": \"AMSI Bypass - AMSI InitFailed\"}, \"config\": {\"type\": \"openbas_implant\", \"label\": {\"en\": \"OpenBAS Implant\", \"fr\": \"OpenBAS Implant\"}, \"expose\": true, \"color_dark\": \"#000000\", \"color_light\": \"#000000\"}, \"fields\": [{\"key\": \"assets\", \"type\": \"asset\", \"label\": \"Assets\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": [\"assets\", \"assetgroups\"]}, {\"key\": \"assetgroups\", \"type\": \"asset-group\", \"label\": \"Asset groups\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": [\"assets\", \"assetgroups\"]}, {\"key\": \"expectations\", \"type\": \"expectation\", \"label\": \"Expectations\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": null, \"predefinedExpectations\": [{\"expectation_name\": \"Expect inject to be prevented\", \"expectation_type\": \"PREVENTION\", \"expectation_score\": 100.0, \"expectation_description\": null, \"expectation_expiration_time\": 21600, \"expectation_expectation_group\": false}, {\"expectation_name\": \"Expect inject to be detected\", \"expectation_type\": \"DETECTION\", \"expectation_score\": 100.0, \"expectation_description\": null, \"expectation_expiration_time\": 21600, \"expectation_expectation_group\": false}]}, {\"key\": \"obfuscator\", \"type\": \"choice\", \"label\": \"Obfuscator\", \"choices\": [{\"label\": \"base64\", \"value\": \"base64\", \"information\": \"CMD does not support base64 obfuscation\"}, {\"label\": \"plain-text\", \"value\": \"plain-text\", \"information\": \"\"}], \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"1\", \"defaultValue\": [\"plain-text\"], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": null}], \"manual\": false, \"context\": {}, \"platforms\": [\"Windows\"], \"variables\": [{\"key\": \"user\", \"type\": \"String\", \"label\": \"User that will receive the injection\", \"children\": [{\"key\": \"user.id\", \"type\": \"String\", \"label\": \"Id of the user in the platform\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.email\", \"type\": \"String\", \"label\": \"Email of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.firstname\", \"type\": \"String\", \"label\": \"First name of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.lastname\", \"type\": \"String\", \"label\": \"Last name of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.lang\", \"type\": \"String\", \"label\": \"Language of the user\", \"children\": [], \"cardinality\": \"1\"}], \"cardinality\": \"1\"}, {\"key\": \"exercise\", \"type\": \"Object\", \"label\": \"Exercise of the current injection\", \"children\": [{\"key\": \"exercise.id\", \"type\": \"String\", \"label\": \"Id of the user in the platform\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"exercise.name\", \"type\": \"String\", \"label\": \"Name of the exercise\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"exercise.description\", \"type\": \"String\", \"label\": \"Description of the exercise\", \"children\": [], \"cardinality\": \"1\"}], \"cardinality\": \"1\"}, {\"key\": \"teams\", \"type\": \"String\", \"label\": \"List of team name for the injection\", \"children\": [], \"cardinality\": \"n\"}, {\"key\": \"player_uri\", \"type\": \"String\", \"label\": \"Player interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"challenges_uri\", \"type\": \"String\", \"label\": \"Challenges interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"scoreboard_uri\", \"type\": \"String\", \"label\": \"Scoreboard interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"lessons_uri\", \"type\": \"String\", \"label\": \"Lessons learned interface platform link\", \"children\": [], \"cardinality\": \"1\"}], \"contract_id\": \"84b3b140-6b7d-47d9-9b61-8fa05882fc7e\", \"needs_executor\": true, \"is_atomic_testing\": true, \"contract_attack_patterns_external_ids\": []}");
    injectorContract.setLabels(Map.of("en", "AMSI Bypass - AMSI InitFailed"));
    injectorContract.setInjector(savedInjector);
    injectorContract.setCreatedAt(Instant.now());
    injectorContract.setUpdatedAt(Instant.now());
    InjectorContract savedInjectorContract = this.injectorContractRepository.save(injectorContract);
    Asset asset = AssetFixture.createDefaultAsset("asset name");
    Asset savedAsset = this.assetRepository.save(asset);
    Agent agent = AgentFixture.createAgent(asset, "external01");
    agent.setLastSeen(Instant.now());
    Agent savedAgent = this.agentRepository.save(agent);
    Inject inject = InjectFixture.createTechnicalInject(savedInjectorContract,
        "AMSI Bypass - AMSI InitFailed",
        savedAsset);
    Inject savedInject = this.injectRepository.save(inject);
    ExecutableInject executableInject = new ExecutableInject(false, true, savedInject, Collections.emptyList(),
        List.of(asset), null, null);
    DetectionExpectation detectionExpectation = ExpectationFixture.createTechnicalDetectionExpectation(asset);
    PreventionExpectation preventionExpectation = ExpectationFixture.createTechnicalPreventionExpectation(asset);

    //-- EXECUTE --
    injectExpectationService.buildAndSaveInjectExpectations(executableInject,
        List.of(preventionExpectation, detectionExpectation));

    //-- ASSERT --
    assertEquals(4, injectExpectationRepository.findAll().spliterator().getExactSizeIfKnown());
    assertEquals(2,
        injectExpectationRepository.findAllByInjectAndAsset(savedInject.getId(), savedAsset.getId()).size());
    assertEquals(2,
        injectExpectationRepository.findAllByInjectAndAgent(savedInject.getId(), savedAgent.getId()).size());

  }
}
