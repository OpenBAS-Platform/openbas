package io.openbas.rest;

import static io.openbas.expectation.ExpectationPropertiesConfig.DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME;
import static io.openbas.expectation.ExpectationType.DETECTION;
import static io.openbas.injectors.openbas.OpenBASInjector.OPENBAS_INJECTOR_ID;
import static io.openbas.injectors.openbas.OpenBASInjector.OPENBAS_INJECTOR_NAME;
import static io.openbas.rest.expectation.ExpectationApi.INJECTS_EXPECTATIONS_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.ExpectationFixture.*;
import static io.openbas.utils.fixtures.InjectExpectationFixture.getInjectExpectationUpdateInput;
import static java.util.Collections.emptyList;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.execution.ExecutableInject;
import io.openbas.model.expectation.DetectionExpectation;
import io.openbas.model.expectation.PreventionExpectation;
import io.openbas.rest.exercise.form.ExpectationUpdateInput;
import io.openbas.rest.inject.form.InjectExpectationBulkUpdateInput;
import io.openbas.rest.inject.form.InjectExpectationUpdateInput;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
class ExpectationApiTest extends IntegrationTest {

  // API Endpoints
  private static final String EXPECTATIONS_URI = "/api/expectations/";

  private static final String INJECTION_NAME = "AMSI Bypass - AMSI InitFailed";
  private static final String INJECTOR_TYPE = "openbas_implant";

  @Autowired private MockMvc mvc;
  @Autowired private AssetGroupRepository assetGroupRepository;
  @Autowired private EndpointRepository endpointRepository;
  @Autowired private AgentRepository agentRepository;
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectorRepository injectorRepository;
  @Autowired private CollectorRepository collectorRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;
  @Autowired private InjectExpectationService injectExpectationService;

  // Saved entities for test setup
  private static Injector savedInjector;
  private static InjectorContract savedInjectorContract;
  private static AssetGroup savedAssetGroup;
  private static Endpoint savedEndpoint;
  private static Agent savedAgent;
  private static Agent savedAgent1;
  private static Inject savedInject;
  private static Collector savedCollector;
  private static Collector savedCollector2;

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

    // -- Targets --
    savedEndpoint = endpointRepository.save(EndpointFixture.createEndpoint());
    savedAgent = agentRepository.save(AgentFixture.createAgent(savedEndpoint, "external01"));
    savedAgent1 = agentRepository.save(AgentFixture.createAgent(savedEndpoint, "external02"));
    savedAssetGroup =
        assetGroupRepository.save(
            AssetGroupFixture.createAssetGroupWithAssets(
                "asset group name", List.of(savedEndpoint)));

    // -- Inject --
    savedInject =
        injectRepository.save(
            InjectFixture.createTechnicalInjectWithAssetGroup(
                savedInjectorContract, INJECTION_NAME, savedAssetGroup));

    // -- Collector --
    Collector collector = new Collector();
    collector.setId(UUID.randomUUID().toString());
    collector.setName("collector-name");
    collector.setType(UUID.randomUUID().toString());
    collector.setExternal(true);
    savedCollector = collectorRepository.save(collector);

    Collector collector2 = new Collector();
    collector2.setId(UUID.randomUUID().toString());
    collector2.setName("collector-2-name");
    collector2.setType(UUID.randomUUID().toString());
    collector2.setExternal(true);
    savedCollector2 = collectorRepository.save(collector2);
  }

  @AfterAll
  void afterAll() {
    agentRepository.deleteAll();
    injectRepository.deleteAll();
    endpointRepository.deleteAll();
    collectorRepository.deleteById(savedCollector.getId());
    collectorRepository.deleteById(savedCollector2.getId());
  }

  @AfterEach
  void afterEach() {
    injectExpectationRepository.deleteAll();
  }

  @Nested
  @WithMockAdminUser
  @DisplayName("Update and delete inject expectation results from UI")
  class ResultInjectExpectation {

    @Test
    @DisplayName("Update and delete Asset group inject expectation result from UI")
    @WithMockAdminUser
    void updateAssetGroupInjectExpectationResults() throws Exception {
      // -- PREPARE --
      // Build and save expectations
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              List.of(savedAssetGroup),
              emptyList());
      DetectionExpectation detectionExpectation =
          createDetectionExpectationForAssetGroup(
              savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationForAsset =
          createTechnicalDetectionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationAgent =
          createTechnicalDetectionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectationAgent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              detectionExpectation,
              detectionExpectationForAsset,
              detectionExpectationAgent,
              detectionExpectationAgent1));

      // Fetch injectExpectation created for asset group
      List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroup(
              savedInject.getId(), savedAssetGroup.getId());
      ExpectationUpdateInput expectationUpdateInput =
          getExpectationUpdateInput("security-platform-1", 40.0);

      // -- EXECUTE --
      String response =
          mvc.perform(
                  put(EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                      .content(asJsonString(expectationUpdateInput))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(40.0, JsonPath.read(response, "$.inject_expectation_results[0].score"));
      assertEquals(
          40.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());
      assertEquals(
          1,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          expectationUpdateInput.getSourceId(),
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getResults()
              .getFirst()
              .getSourceId());
      assertEquals(
          40.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());
      assertEquals(
          40.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getScore());

      // Delete results from Asset group: Add new result and delete last result

      // -- PREPARE --
      expectationUpdateInput = getExpectationUpdateInput("security-platform-2", 250.0);

      // -- EXECUTE --
      response =
          mvc.perform(
                  put(EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                      .content(asJsonString(expectationUpdateInput))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(250.0, JsonPath.read(response, "$.inject_expectation_results[1].score"));
      assertEquals(
          250.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getScore());
      assertEquals(
          2,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          2,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          2,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getResults()
              .size());

      // -- EXECUTE --
      mvc.perform(
              put(
                  EXPECTATIONS_URI
                      + "/"
                      + injectExpectations.get(0).getId()
                      + "/"
                      + expectationUpdateInput.getSourceId()
                      + "/delete"))
          .andExpect(status().is2xxSuccessful());

      assertEquals(
          40.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getScore());
      assertEquals(
          1,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          1,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          1,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          40.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());
    }

    @Test
    @DisplayName("Update and delete asset inject expectation result from UI")
    @WithMockAdminUser
    void updateAssetInjectExpectationResults() throws Exception {
      // -- PREPARE --
      // Build and save expectations
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              emptyList(),
              emptyList());
      DetectionExpectation detectionExpectationForAsset =
          createTechnicalDetectionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationAgent =
          createTechnicalDetectionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectationAgent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              detectionExpectationForAsset, detectionExpectationAgent, detectionExpectationAgent1));

      // Fetch injectExpectation created for asset group
      List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAsset(
              savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId());
      ExpectationUpdateInput expectationUpdateInput =
          getExpectationUpdateInput("security-platform-1", 50.0);

      // -- EXECUTE --
      String response =
          mvc.perform(
                  put(EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                      .content(asJsonString(expectationUpdateInput))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(50.0, JsonPath.read(response, "$.inject_expectation_results[0].score"));
      assertEquals(
          1,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          50.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());
      assertEquals(
          50.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getScore());

      // Delete results from Asset: Add new result and delete the last one

      // -- PREPARE --
      expectationUpdateInput = getExpectationUpdateInput("security-platform-2", 180.0);

      // -- EXECUTE --
      response =
          mvc.perform(
                  put(EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                      .content(asJsonString(expectationUpdateInput))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(180.0, JsonPath.read(response, "$.inject_expectation_results[1].score"));
      assertEquals(
          180.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());
      assertEquals(
          2,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          2,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getResults()
              .size());

      // -- EXECUTE --
      mvc.perform(
              put(
                  EXPECTATIONS_URI
                      + "/"
                      + injectExpectations.get(0).getId()
                      + "/"
                      + expectationUpdateInput.getSourceId()
                      + "/delete"))
          .andExpect(status().is2xxSuccessful());

      assertEquals(
          50.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());
      assertEquals(
          1,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          1,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getResults()
              .size());
      assertEquals(
          50.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getScore());
    }
  }

  @Nested
  @WithMockAdminUser
  @DisplayName("Fetch and update InjectExpectations from collectors")
  class ProcessInjectExpectationsForCollectors {

    @Test
    @DisplayName("Get Inject Expectations for a Specific Source")
    void getInjectExpectationsForSource() throws Exception {
      // -- PREPARE --
      // Build and save expectations
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              emptyList(),
              emptyList());
      DetectionExpectation detectionExpectationForAsset =
          createTechnicalDetectionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);

      DetectionExpectation detectionExpectationAgent =
          createTechnicalDetectionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectationAgent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              detectionExpectationForAsset, detectionExpectationAgent, detectionExpectationAgent1));

      // Update one expectation from one agent with source collector-id
      List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId());

      injectExpectations
          .get(0)
          .setResults(
              List.of(
                  InjectExpectationResult.builder()
                      .sourceId(savedCollector.getId())
                      .sourceName(savedCollector.getName())
                      .sourceType(savedCollector.getType())
                      .score(50.0)
                      .build()));

      injectExpectationRepository.save(injectExpectations.get(0));

      // -- EXECUTE --
      String response =
          mvc.perform(
                  get(INJECTS_EXPECTATIONS_URI + "/assets/" + savedCollector.getId())
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(1, ((List<?>) JsonPath.read(response, "$")).size());
      assertEquals(
          savedEndpoint.getId(), JsonPath.read(response, "$.[0].inject_expectation_asset"));
      assertEquals(savedAgent1.getId(), JsonPath.read(response, "$.[0].inject_expectation_agent"));
    }

    @Test
    @DisplayName("Get Prevention Inject Expectations for a Specific Source")
    void getInjectPreventionExpectationsForSource() throws Exception {
      // -- PREPARE --
      // Build and save expectations for an asset with 2 agents
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              emptyList(),
              emptyList());
      PreventionExpectation preventionExpectationForAsset =
          ExpectationFixture.createTechnicalPreventionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);

      PreventionExpectation preventionExpectationAgent =
          ExpectationFixture.createTechnicalPreventionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      PreventionExpectation preventionExpectationAgent1 =
          ExpectationFixture.createTechnicalPreventionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              preventionExpectationForAsset,
              preventionExpectationAgent,
              preventionExpectationAgent1));

      // -- EXECUTE --
      String response =
          mvc.perform(
                  get(INJECTS_EXPECTATIONS_URI + "/prevention/" + savedCollector.getId())
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(2, ((List<?>) JsonPath.read(response, "$")).size());
      assertEquals(
          savedEndpoint.getId(), JsonPath.read(response, "$.[0].inject_expectation_asset"));
      assertEquals("PREVENTION", JsonPath.read(response, "$.[0].inject_expectation_type"));

      // -- PREPARE --
      // Update one expectation from one agent with source collector-id then this expectation is
      // filled and it should return just one
      List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId());

      injectExpectations
          .get(0)
          .setResults(
              List.of(
                  InjectExpectationResult.builder()
                      .sourceId(savedCollector.getId())
                      .sourceName(savedCollector.getName())
                      .sourceType(savedCollector.getType())
                      .score(80.0)
                      .build()));

      injectExpectationRepository.save(injectExpectations.get(0));

      // -- EXECUTE --
      response =
          mvc.perform(
                  get(INJECTS_EXPECTATIONS_URI + "/prevention/" + savedCollector.getId())
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(1, ((List<?>) JsonPath.read(response, "$")).size());
      assertEquals(
          savedEndpoint.getId(), JsonPath.read(response, "$.[0].inject_expectation_asset"));
      assertEquals(savedAgent.getId(), JsonPath.read(response, "$.[0].inject_expectation_agent"));
    }

    @Test
    @DisplayName("Get Detection Inject Expectations for a Specific Source")
    void getInjectDetectionExpectationsForSource() throws Exception {
      // -- PREPARE --
      // Build and save expectations for an asset with 2 agents
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              emptyList(),
              emptyList());
      DetectionExpectation detectionExpectationForAsset =
          createTechnicalDetectionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);

      DetectionExpectation detectionExpectationAgent =
          createTechnicalDetectionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectationAgent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              detectionExpectationForAsset, detectionExpectationAgent, detectionExpectationAgent1));

      // -- EXECUTE --
      String response =
          mvc.perform(
                  get(INJECTS_EXPECTATIONS_URI + "/detection/" + savedCollector.getId())
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(2, ((List<?>) JsonPath.read(response, "$")).size());
      assertEquals(
          savedEndpoint.getId(), JsonPath.read(response, "$.[0].inject_expectation_asset"));
      assertEquals("DETECTION", JsonPath.read(response, "$.[0].inject_expectation_type"));

      // -- PREPARE --
      // Update one expectation from one agent with source collector-id then it should return one
      // expectation
      List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId());

      injectExpectations
          .get(0)
          .setResults(
              List.of(
                  InjectExpectationResult.builder()
                      .sourceId(savedCollector.getId())
                      .sourceName(savedCollector.getName())
                      .sourceType(savedCollector.getType())
                      .score(90.0)
                      .build()));

      injectExpectationRepository.save(injectExpectations.get(0));

      // -- EXECUTE --
      response =
          mvc.perform(
                  get(INJECTS_EXPECTATIONS_URI + "/detection/" + savedCollector.getId())
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // -- ASSERT --
      assertEquals(1, ((List<?>) JsonPath.read(response, "$")).size());
      assertEquals(
          savedEndpoint.getId(), JsonPath.read(response, "$.[0].inject_expectation_asset"));
      assertEquals(savedAgent.getId(), JsonPath.read(response, "$.[0].inject_expectation_agent"));
    }

    @Test
    @DisplayName(
        "Update Inject expectation from collector and two agents : one success and one failed")
    void updateInjectExpectationWithOneSuccessAndOneFailed() throws Exception {
      // -- PREPARE --
      // Build and save expectations for an asset with 2 agents
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              List.of(savedAssetGroup),
              emptyList());
      DetectionExpectation detectionExpectationForAssetGroup =
          createDetectionExpectationForAssetGroup(
              savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationForAsset =
          createTechnicalDetectionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationAgent =
          createTechnicalDetectionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectationAgent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              detectionExpectationForAssetGroup,
              detectionExpectationForAsset,
              detectionExpectationAgent,
              detectionExpectationAgent1));

      // Fetch injectExpectation created for agent 1
      List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId());
      InjectExpectationUpdateInput expectationUpdateInput =
          getInjectExpectationUpdateInput(savedCollector.getId(), "Detected", true);

      // -- EXECUTE --
      mvc.perform(
              put(INJECTS_EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                  .content(asJsonString(expectationUpdateInput))
                  .contentType(MediaType.APPLICATION_JSON)
                  .accept(MediaType.APPLICATION_JSON))
          .andReturn()
          .getResponse()
          .getContentAsString();

      // -- ASSERT --
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getScore());
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());
      assertEquals(
          injectExpectations.get(0).getExpectedScore(),
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getScore());
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());

      // Fetch injectExpectation created for second agent
      injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId());
      expectationUpdateInput =
          getInjectExpectationUpdateInput(savedCollector.getId(), "Not Detected", false);

      // -- EXECUTE --
      mvc.perform(
              put(INJECTS_EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                  .content(asJsonString(expectationUpdateInput))
                  .contentType(MediaType.APPLICATION_JSON)
                  .accept(MediaType.APPLICATION_JSON))
          .andReturn()
          .getResponse()
          .getContentAsString();

      // -- ASSERT --
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getScore());
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getScore());
      assertEquals(
          0.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());
    }

    @Test
    @DisplayName("Update Inject expectation from collector with success")
    void updateInjectExpectationWithTwoSuccess() throws Exception {
      // -- PREPARE --
      // Build and save expectations for an asset with 2 agents
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              List.of(savedAssetGroup),
              emptyList());
      DetectionExpectation detectionExpectationForAssetGroup =
          createDetectionExpectationForAssetGroup(
              savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationForAsset =
          createTechnicalDetectionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationAgent =
          createTechnicalDetectionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectationAgent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              detectionExpectationForAssetGroup,
              detectionExpectationForAsset,
              detectionExpectationAgent,
              detectionExpectationAgent1));

      // Fetch injectExpectation created for agent 1
      List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId());
      InjectExpectationUpdateInput expectationUpdateInput =
          getInjectExpectationUpdateInput(savedCollector.getId(), "Detected", true);

      // -- EXECUTE --
      mvc.perform(
              put(INJECTS_EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                  .content(asJsonString(expectationUpdateInput))
                  .contentType(MediaType.APPLICATION_JSON)
                  .accept(MediaType.APPLICATION_JSON))
          .andExpect(status().is2xxSuccessful());

      // -- ASSERT --
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getScore());
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());
      assertEquals(
          injectExpectations.get(0).getExpectedScore(),
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getScore());
      assertEquals(
          null,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());

      // Fetch injectExpectation created for second agent
      injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId());
      expectationUpdateInput =
          getInjectExpectationUpdateInput(savedCollector.getId(), "Detected", true);

      // -- EXECUTE --
      mvc.perform(
              put(INJECTS_EXPECTATIONS_URI + "/" + injectExpectations.get(0).getId())
                  .content(asJsonString(expectationUpdateInput))
                  .contentType(MediaType.APPLICATION_JSON)
                  .accept(MediaType.APPLICATION_JSON))
          .andExpect(status().is2xxSuccessful());

      // -- ASSERT --
      assertEquals(
          100.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getScore());
      assertEquals(
          100.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());
      assertEquals(
          injectExpectations.get(0).getExpectedScore(),
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());
      assertEquals(
          100.0,
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId())
              .getFirst()
              .getScore());
    }

    @Test
    @DisplayName("Bulk update Inject expectation from collector with success")
    void bulkUpdateInjectExpectationWithTwoSuccess() throws Exception {
      // -- PREPARE --
      // Build and save expectations for an asset with 2 agents
      ExecutableInject executableInject =
          new ExecutableInject(
              false,
              true,
              savedInject,
              emptyList(),
              List.of(savedEndpoint),
              List.of(savedAssetGroup),
              emptyList());
      DetectionExpectation detectionExpectationForAssetGroup =
          createDetectionExpectationForAssetGroup(
              savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationForAsset =
          createTechnicalDetectionExpectationForAsset(
              savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
      DetectionExpectation detectionExpectationAgent =
          createTechnicalDetectionExpectation(
              savedAgent,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectationAgent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());
      DetectionExpectation detectionExpectation2Agent1 =
          createTechnicalDetectionExpectation(
              savedAgent1,
              savedEndpoint,
              savedAssetGroup,
              DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
              emptyList());

      injectExpectationService.buildAndSaveInjectExpectations(
          executableInject,
          List.of(
              detectionExpectationForAssetGroup,
              detectionExpectationForAsset,
              detectionExpectationAgent,
              detectionExpectationAgent1,
              detectionExpectation2Agent1));

      // Fetch injectExpectation created for agent 1
      final List<InjectExpectation> injectExpectations =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId());
      InjectExpectationUpdateInput expectationUpdateInput =
          getInjectExpectationUpdateInput(savedCollector.getId(), "Detected", true);
      InjectExpectationUpdateInput expectationUpdateInput1 =
          getInjectExpectationUpdateInput(savedCollector.getId(), "Not detected", false);

      InjectExpectationBulkUpdateInput inputs =
          new InjectExpectationBulkUpdateInput(
              Map.of(
                  injectExpectations.get(0).getId(), expectationUpdateInput,
                  injectExpectations.get(1).getId(), expectationUpdateInput1));

      // -- EXECUTE --
      mvc.perform(
              put(INJECTS_EXPECTATIONS_URI + "/bulk")
                  .content(asJsonString(inputs))
                  .contentType(MediaType.APPLICATION_JSON)
                  .accept(MediaType.APPLICATION_JSON))
          .andExpect(status().is2xxSuccessful());

      // -- ASSERT --
      assertNull(
          injectExpectationRepository
              .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
              .getFirst()
              .getScore());
      assertNull(
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAsset(
                  savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
              .getFirst()
              .getScore());

      List<InjectExpectation> injectExpectationsForAgent1 =
          injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
              savedInject.getId(), savedAssetGroup.getId(), savedAgent1.getId());

      assertTrue(
          injectExpectationsForAgent1.stream()
              .anyMatch(
                  expectation ->
                      expectation.getScore().equals(100D)
                          && expectation.getResults().getFirst().getResult().equals("Detected")));
      assertTrue(
          injectExpectationsForAgent1.stream()
              .anyMatch(
                  expectation ->
                      expectation.getScore().equals(0D)
                          && expectation
                              .getResults()
                              .getFirst()
                              .getResult()
                              .equals("Not detected")));

      assertNull(
          injectExpectationRepository
              .findAllByInjectAndAssetGroupAndAgent(
                  savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
              .getFirst()
              .getScore());
    }
  }

  @Test
  @WithMockAdminUser
  @DisplayName("Update Inject expectation from two collectors with one agent")
  void updateInjectExpectationFromTwoCollectors() throws Exception {
    // -- PREPARE --
    // Build and save expectations for an asset with 1 agent
    ExecutableInject executableInject =
        new ExecutableInject(
            false,
            true,
            savedInject,
            emptyList(),
            List.of(savedEndpoint),
            List.of(savedAssetGroup),
            emptyList());
    DetectionExpectation detectionExpectationForAssetGroup =
        createDetectionExpectationForAssetGroup(
            savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
    DetectionExpectation detectionExpectationForAsset =
        createTechnicalDetectionExpectationForAsset(
            savedEndpoint, savedAssetGroup, DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME);
    DetectionExpectation detectionExpectationAgent =
        createTechnicalDetectionExpectation(
            savedAgent,
            savedEndpoint,
            savedAssetGroup,
            DEFAULT_TECHNICAL_EXPECTATION_EXPIRATION_TIME,
            emptyList());

    injectExpectationService.buildAndSaveInjectExpectations(
        executableInject,
        List.of(
            detectionExpectationForAssetGroup,
            detectionExpectationForAsset,
            detectionExpectationAgent));

    // Add results for created injectExpectation
    List<InjectExpectation> injectExpectations =
        injectExpectationRepository.findAllByInjectAndAssetGroupAndAgent(
            savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId());
    InjectExpectationUpdateInput expectationUpdateInput =
        getInjectExpectationUpdateInput(savedCollector.getId(), DETECTION.successLabel, true);
    InjectExpectationUpdateInput expectationUpdateInput2 =
        getInjectExpectationUpdateInput(savedCollector2.getId(), DETECTION.failureLabel, false);

    mvc.perform(
            put(INJECTS_EXPECTATIONS_URI + "/" + injectExpectations.getFirst().getId())
                .content(asJsonString(expectationUpdateInput))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    mvc.perform(
            put(INJECTS_EXPECTATIONS_URI + "/" + injectExpectations.getFirst().getId())
                .content(asJsonString(expectationUpdateInput2))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    // -- ASSERT --
    assertEquals(
        2,
        injectExpectationRepository
            .findAllByInjectAndAssetGroup(savedInject.getId(), savedAssetGroup.getId())
            .getFirst()
            .getResults()
            .size());
    assertEquals(
        100.0,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAsset(
                savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
            .getFirst()
            .getResults()
            .stream()
            .filter(result -> result.getSourceId().equals(savedCollector.getId()))
            .map(InjectExpectationResult::getScore)
            .findFirst()
            .get());
    assertEquals(
        0.0,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAsset(
                savedInject.getId(), savedAssetGroup.getId(), savedEndpoint.getId())
            .getFirst()
            .getResults()
            .stream()
            .filter(result -> result.getSourceId().equals(savedCollector2.getId()))
            .map(InjectExpectationResult::getScore)
            .findFirst()
            .get());
    assertEquals(
        100.0,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(
                savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
            .getFirst()
            .getResults()
            .stream()
            .filter(result -> result.getSourceId().equals(savedCollector.getId()))
            .map(InjectExpectationResult::getScore)
            .findFirst()
            .get());
    assertEquals(
        0.0,
        injectExpectationRepository
            .findAllByInjectAndAssetGroupAndAgent(
                savedInject.getId(), savedAssetGroup.getId(), savedAgent.getId())
            .getFirst()
            .getResults()
            .stream()
            .filter(result -> result.getSourceId().equals(savedCollector2.getId()))
            .map(InjectExpectationResult::getScore)
            .findFirst()
            .get());
  }
}
