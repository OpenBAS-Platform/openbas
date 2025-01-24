package io.openbas.rest;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@TestInstance(PER_CLASS)
public class ExpectationApiTest extends IntegrationTest {

  public static final String API_EXPECTATIONS = "/api/expectations/";
  public static final String API_INJECTS_EXPECTATIONS = "/api/injects/expectations";

  @Autowired
  private MockMvc mvc;

  private static SecurityPlatform SAVEDSECURITYPLATFORM;
  private static Injector SAVEDINJECTOR;
  private static InjectorContract SAVEDINJECTORCONTRACT;
  private static Asset SAVEDASSET;
  private static Agent SAVEDAGENT;
  private static Inject SAVEDINJECT;

  @Autowired
  private AssetRepository assetRepository;
  @Autowired
  private AgentRepository agentRepository;
  @Autowired
  private SecurityPlatformRepository securityPlatformRepository;
  @Autowired
  private InjectRepository injectRepository;
  @Autowired
  private InjectorRepository injectorRepository;
  @Autowired
  private InjectorContractRepository injectorContractRepository;
  @Autowired
  private InjectStatusRepository injectStatusRepository;
  @Autowired
  private InjectExpectationService injectExpectationService;
  @Autowired
  private InjectExpectationRepository injectExpectationRepository;

  @BeforeAll
  void beforeAll() {
    SAVEDSECURITYPLATFORM = securityPlatformRepository.save(
        SecurityPlatformFixture.createSecurityPlatform("My platform",
            SecurityPlatform.SECURITY_TYPE.SOAR));
    InjectorContract injectorContract =
        InjectorContractFixture.createInjectorContract(
            "84b3b140-6b7d-47d9-9b61-8fa05882fc7e",
            Map.of("en", "AMSI Bypass - AMSI InitFailed"),
            "{\"label\": {\"en\": \"AMSI Bypass - AMSI InitFailed\", \"fr\": \"AMSI Bypass - AMSI InitFailed\"}, \"config\": {\"type\": \"openbas_implant\", \"label\": {\"en\": \"OpenBAS Implant\", \"fr\": \"OpenBAS Implant\"}, \"expose\": true, \"color_dark\": \"#000000\", \"color_light\": \"#000000\"}, \"fields\": [{\"key\": \"assets\", \"type\": \"asset\", \"label\": \"Assets\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": [\"assets\", \"assetgroups\"]}, {\"key\": \"assetgroups\", \"type\": \"asset-group\", \"label\": \"Asset groups\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": [\"assets\", \"assetgroups\"]}, {\"key\": \"expectations\", \"type\": \"expectation\", \"label\": \"Expectations\", \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"n\", \"defaultValue\": [], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": null, \"predefinedExpectations\": [{\"expectation_name\": \"Expect inject to be prevented\", \"expectation_type\": \"PREVENTION\", \"expectation_score\": 100.0, \"expectation_description\": null, \"expectation_expiration_time\": 21600, \"expectation_expectation_group\": false}, {\"expectation_name\": \"Expect inject to be detected\", \"expectation_type\": \"DETECTION\", \"expectation_score\": 100.0, \"expectation_description\": null, \"expectation_expiration_time\": 21600, \"expectation_expectation_group\": false}]}, {\"key\": \"obfuscator\", \"type\": \"choice\", \"label\": \"Obfuscator\", \"choices\": [{\"label\": \"base64\", \"value\": \"base64\", \"information\": \"CMD does not support base64 obfuscation\"}, {\"label\": \"plain-text\", \"value\": \"plain-text\", \"information\": \"\"}], \"readOnly\": false, \"mandatory\": false, \"cardinality\": \"1\", \"defaultValue\": [\"plain-text\"], \"linkedFields\": [], \"linkedValues\": [], \"mandatoryGroups\": null}], \"manual\": false, \"context\": {}, \"platforms\": [\"Windows\"], \"variables\": [{\"key\": \"user\", \"type\": \"String\", \"label\": \"User that will receive the injection\", \"children\": [{\"key\": \"user.id\", \"type\": \"String\", \"label\": \"Id of the user in the platform\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.email\", \"type\": \"String\", \"label\": \"Email of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.firstname\", \"type\": \"String\", \"label\": \"First name of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.lastname\", \"type\": \"String\", \"label\": \"Last name of the user\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"user.lang\", \"type\": \"String\", \"label\": \"Language of the user\", \"children\": [], \"cardinality\": \"1\"}], \"cardinality\": \"1\"}, {\"key\": \"exercise\", \"type\": \"Object\", \"label\": \"Exercise of the current injection\", \"children\": [{\"key\": \"exercise.id\", \"type\": \"String\", \"label\": \"Id of the user in the platform\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"exercise.name\", \"type\": \"String\", \"label\": \"Name of the exercise\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"exercise.description\", \"type\": \"String\", \"label\": \"Description of the exercise\", \"children\": [], \"cardinality\": \"1\"}], \"cardinality\": \"1\"}, {\"key\": \"teams\", \"type\": \"String\", \"label\": \"List of team name for the injection\", \"children\": [], \"cardinality\": \"n\"}, {\"key\": \"player_uri\", \"type\": \"String\", \"label\": \"Player interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"challenges_uri\", \"type\": \"String\", \"label\": \"Challenges interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"scoreboard_uri\", \"type\": \"String\", \"label\": \"Scoreboard interface platform link\", \"children\": [], \"cardinality\": \"1\"}, {\"key\": \"lessons_uri\", \"type\": \"String\", \"label\": \"Lessons learned interface platform link\", \"children\": [], \"cardinality\": \"1\"}], \"contract_id\": \"84b3b140-6b7d-47d9-9b61-8fa05882fc7e\", \"needs_executor\": true, \"is_atomic_testing\": true, \"contract_attack_patterns_external_ids\": []}");
    SAVEDINJECTOR =
        this.injectorRepository.save(
            InjectorFixture.createInjector(
                "49229430-b5b5-431f-ba5b-f36f599b0144", "OpenBAS Implant", "openbas_implant"));
    injectorContract.setInjector(SAVEDINJECTOR);
    SAVEDINJECTORCONTRACT = this.injectorContractRepository.save(injectorContract);
    SAVEDASSET = this.assetRepository.save(AssetFixture.createDefaultAsset("asset name"));

    Agent agent = AgentFixture.createAgent(SAVEDASSET, "external01");
    agent.setLastSeen(Instant.now());
    SAVEDAGENT = this.agentRepository.save(agent);
    SAVEDINJECT = this.injectRepository.save(InjectFixture.createTechnicalInject(
        SAVEDINJECTORCONTRACT, "AMSI Bypass - AMSI InitFailed", SAVEDASSET));
    ExecutableInject executableInject =
        new ExecutableInject(
            false, true, SAVEDINJECT, Collections.emptyList(), List.of(SAVEDASSET), null, null);
    DetectionExpectation detectionExpectation =
        ExpectationFixture.createTechnicalDetectionExpectation(SAVEDASSET);
    PreventionExpectation preventionExpectation =
        ExpectationFixture.createTechnicalPreventionExpectation(SAVEDASSET);
    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject, List.of(preventionExpectation, detectionExpectation));
  }

  @AfterEach
  void afterEach() {
    injectExpectationRepository.deleteAll();
  }

  @Test
  @DisplayName("Update expectation result")
  @WithMockAdminUser
  void updateInjectExpectationResults() throws Exception {
    //--PREPARE--
    String injectExpectationId = injectExpectationRepository
        .findAllByInjectAndAsset(SAVEDINJECT.getId(), SAVEDASSET.getId()).getFirst().getId();
    ExpectationUpdateInput expectationUpdateInput = buildExpectationUpdateInput();

    //-- EXECUTE--
    String response = mvc.perform(
            put(API_EXPECTATIONS + "/" + injectExpectationId)
                .content(asJsonString(expectationUpdateInput))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    // --ASSERT--
    assertEquals(40.0, JsonPath.read(response, "$.inject_expectation_results[0].score"));
  }

  @Test
  @DisplayName("Delete expectation result")
  void deleteInjectExpectationResult() throws Exception {
  }

  @Test
  @DisplayName("Get Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectExpectationsAssetsNotFilledForSource() throws Exception {
  }

  @Test
  @DisplayName("Get Prevention Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectPreventionExpectationsNotFilledForSource() throws Exception {
  }

  @Test
  @DisplayName("Get Detection Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectDetectionExpectationsNotFilledForSource() throws Exception {
  }

  @Test
  @DisplayName("Update Inject expectation")
  @WithMockAdminUser
  void updateInjectExpectation() throws Exception {
  }

  @AfterAll
  void afterAll() {
    injectStatusRepository.deleteAll();
    agentRepository.delete(SAVEDAGENT);
    injectRepository.deleteAll();
    assetRepository.delete(SAVEDASSET);
    injectorContractRepository.delete(SAVEDINJECTORCONTRACT);
    injectorRepository.delete(SAVEDINJECTOR);

  }

  //--PRIVATE--
  private ExpectationUpdateInput buildExpectationUpdateInput() {
    ExpectationUpdateInput expectationUpdateInput = new ExpectationUpdateInput();
    expectationUpdateInput.setSourceId(SAVEDSECURITYPLATFORM.getId());
    expectationUpdateInput.setSourceType("security-platform");
    expectationUpdateInput.setSourceName(SAVEDSECURITYPLATFORM.getName());
    expectationUpdateInput.setScore(40.0);
    return expectationUpdateInput;
  }
}
