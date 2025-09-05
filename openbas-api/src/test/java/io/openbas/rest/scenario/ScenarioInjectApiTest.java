package io.openbas.rest.scenario;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.rest.scenario.ScenarioApi.SCENARIO_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.injectors.manual.ManualContract;
import io.openbas.rest.inject.form.InjectAssistantInput;
import io.openbas.rest.inject.form.InjectInput;
import io.openbas.service.AssetGroupService;
import io.openbas.service.EndpointService;
import io.openbas.service.ScenarioService;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.AttackPatternComposer;
import io.openbas.utils.fixtures.composers.InjectorContractComposer;
import io.openbas.utils.fixtures.composers.PayloadComposer;
import io.openbas.utils.fixtures.files.AttackPatternFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.servlet.ServletException;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import org.json.JSONArray;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@TestInstance(PER_CLASS)
class ScenarioInjectApiTest extends IntegrationTest {

  static String SCENARIO_INJECT_ID;
  static Scenario SCENARIO;
  static AttackPattern ATTACKPATTERN;
  static Endpoint LINUX_X86_64;
  static Endpoint WINDOWS_X86_64;
  static Endpoint WINDOWS_ARM64;
  static AssetGroup ALL_ASSETGROUP;
  static AssetGroup ALL_WINDOWS;

  @Autowired private InjectorFixture injectorFixture;

  @Autowired private MockMvc mvc;
  @Autowired private AttackPatternComposer attackPatternComposer;
  @Autowired private InjectorContractComposer injectorContractComposer;
  @Autowired private PayloadComposer payloadComposer;

  @Autowired private AttackPatternRepository attackPatternRepository;
  @Autowired private InjectRepository injectRepository;
  @Autowired private AssetGroupService assetGroupService;
  @Autowired private EndpointService endpointService;
  @Autowired private ScenarioService scenarioService;

  List<InjectorContractComposer.Composer> injectorContractWrapperComposers = new ArrayList<>();

  @BeforeAll
  void beforeAll() {
    Scenario scenario = new Scenario();
    scenario.setName("Scenario name");
    scenario.setFrom("test@test.com");
    scenario.setReplyTos(List.of("test@test.com"));
    SCENARIO = scenarioService.createScenario(scenario);

    ATTACKPATTERN = attackPatternRepository.save(AttackPatternFixture.createDefaultAttackPattern());
    LINUX_X86_64 =
        endpointService.createEndpoint(
            EndpointFixture.createDefaultLinuxEndpointWithArch(Endpoint.PLATFORM_ARCH.x86_64));
    WINDOWS_X86_64 =
        endpointService.createEndpoint(
            EndpointFixture.createDefaultWindowsEndpointWithArch(Endpoint.PLATFORM_ARCH.x86_64));
    WINDOWS_ARM64 =
        endpointService.createEndpoint(
            EndpointFixture.createDefaultWindowsEndpointWithArch(Endpoint.PLATFORM_ARCH.arm64));
    ALL_ASSETGROUP =
        assetGroupService.createAssetGroup(
            AssetGroupFixture.createAssetGroupWithAssets(
                "all", List.of(LINUX_X86_64, WINDOWS_ARM64, WINDOWS_X86_64)));
    ALL_WINDOWS =
        assetGroupService.createAssetGroup(
            AssetGroupFixture.createAssetGroupWithAssets(
                "all", List.of(WINDOWS_ARM64, WINDOWS_X86_64)));
  }

  @AfterAll
  void afterAll() {
    attackPatternRepository.delete(ATTACKPATTERN);
  }

  @DisplayName("Add an inject for scenario")
  @Test
  @Order(1)
  @WithMockAdminUser
  void addInjectForScenarioTest() throws Exception {
    // -- PREPARE --
    InjectInput input = new InjectInput();
    input.setTitle("Test inject");
    input.setInjectorContract(EMAIL_DEFAULT);
    input.setDependsDuration(0L);

    // -- EXECUTE --
    String response =
        mvc.perform(
                post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    SCENARIO_INJECT_ID = JsonPath.read(response, "$.inject_id");
    response =
        mvc.perform(get(SCENARIO_URI + "/" + SCENARIO.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(SCENARIO_INJECT_ID, JsonPath.read(response, "$.scenario_injects[0]"));
  }

  @DisplayName("Retrieve injects for scenario")
  @Test
  @Order(2)
  @WithMockAdminUser
  void retrieveInjectsForScenarioTest() throws Exception {
    // -- EXECUTE --
    String response =
        mvc.perform(
                get(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(SCENARIO_INJECT_ID, JsonPath.read(response, "$[0].inject_id"));
  }

  @DisplayName("Retrieve inject for scenario")
  @Test
  @Order(3)
  @WithMockAdminUser
  void retrieveInjectForScenarioTest() throws Exception {
    // -- EXECUTE --
    String response =
        mvc.perform(
                get(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/" + SCENARIO_INJECT_ID)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(SCENARIO_INJECT_ID, JsonPath.read(response, "$.inject_id"));
  }

  @DisplayName("Update inject for scenario")
  @Test
  @Order(4)
  @WithMockAdminUser
  void updateInjectForScenarioTest() throws Exception {
    // -- PREPARE --
    Inject inject = injectRepository.findById(SCENARIO_INJECT_ID).orElseThrow();
    InjectInput input = new InjectInput();
    String injectTitle = "A new title";
    input.setTitle(injectTitle);
    input.setInjectorContract(
        inject.getInjectorContract().map(InjectorContract::getId).orElse(null));
    input.setDependsDuration(inject.getDependsDuration());

    // -- EXECUTE --
    String response =
        mvc.perform(
                put(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/" + SCENARIO_INJECT_ID)
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // -- ASSERT --
    assertNotNull(response);
    assertEquals(injectTitle, JsonPath.read(response, "$.inject_title"));
  }

  @DisplayName("Delete inject for scenario")
  @Test
  @Order(5)
  @WithMockAdminUser
  void deleteInjectForScenarioTest() throws Exception {
    // -- EXECUTE 1 ASSERT --
    mvc.perform(delete(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/" + SCENARIO_INJECT_ID))
        .andExpect(status().is2xxSuccessful());

    assertFalse(injectRepository.existsById(SCENARIO_INJECT_ID));
  }

  @Nested
  @DisplayName("Inject assistant for scenario")
  @WithMockAdminUser
  @Transactional
  class ScenarioInjectsAssistant {

    private InjectorContract buildInjectorContract(
        AttackPattern attackPattern,
        Endpoint.PLATFORM_TYPE[] platforms,
        Payload.PAYLOAD_EXECUTION_ARCH architecture) {
      InjectorContractComposer.Composer newInjectorContractComposer =
          injectorContractComposer
              .forInjectorContract(
                  InjectorContractFixture.createInjectorContractWithPlatforms(platforms))
              .withInjector(injectorFixture.getWellKnownObasImplantInjector())
              .withAttackPattern(attackPatternComposer.forAttackPattern(attackPattern))
              .withPayload(
                  payloadComposer.forPayload(
                      PayloadFixture.createDefaultCommandWithPlatformsAndArchitecture(
                          platforms, architecture)))
              .persist();
      injectorContractWrapperComposers.add(newInjectorContractComposer);
      return newInjectorContractComposer.get();
    }

    @DisplayName("Given number of inject by ttp more than 5, should throw an exception")
    @Test
    void given_injectByTTPNumberMoreThan5_should_throwAnException() {
      // --PREPARE--
      InjectAssistantInput input = new InjectAssistantInput();
      input.setAssetGroupIds(List.of(ALL_ASSETGROUP.getId()));
      input.setAssetIds(List.of(LINUX_X86_64.getId(), WINDOWS_X86_64.getId()));
      input.setAttackPatternIds(List.of(ATTACKPATTERN.getId()));
      input.setInjectByTTPNumber(10);

      // --EXECUTE--
      Exception exception =
          assertThrows(
              ServletException.class,
              () ->
                  mvc.perform(
                      post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/assistant")
                          .content(asJsonString(input))
                          .contentType(MediaType.APPLICATION_JSON)
                          .accept(MediaType.APPLICATION_JSON)));

      // --ASSERT--
      assertTrue(
          exception
              .getMessage()
              .contains("Number of inject by ttp must be less than or equal to 5"));
    }

    @DisplayName(
        "Given an injector contract matching all platforms, should create one inject with all assets and asset groups")
    @Test
    void
        given_InjectorContractMatchingAllPlatforms_should_createOneInjectWithAllAssetsAndAssetGroup()
            throws Exception {
      Endpoint.PLATFORM_TYPE[] allPlatforms =
          new Endpoint.PLATFORM_TYPE[] {
            Endpoint.PLATFORM_TYPE.MacOS,
            Endpoint.PLATFORM_TYPE.Linux,
            Endpoint.PLATFORM_TYPE.Windows
          };
      buildInjectorContract(
          ATTACKPATTERN, allPlatforms, Payload.PAYLOAD_EXECUTION_ARCH.ALL_ARCHITECTURES);

      InjectAssistantInput input = new InjectAssistantInput();
      input.setAssetGroupIds(List.of(ALL_ASSETGROUP.getId()));
      input.setAssetIds(List.of(LINUX_X86_64.getId(), WINDOWS_X86_64.getId()));
      input.setAttackPatternIds(List.of(ATTACKPATTERN.getId()));
      input.setInjectByTTPNumber(1);

      String response =
          mvc.perform(
                  post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/assistant")
                      .content(asJsonString(input))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Set<Inject> injects = injectRepository.findByScenarioId(SCENARIO.getId());
      Inject inject = injects.stream().findFirst().get();

      JSONArray jsonArray = new JSONArray(response);
      assertEquals(1, jsonArray.length());
      assertEquals(JsonPath.read(response, "$[0].inject_id"), inject.getId());

      assertEquals(1, injects.size());
      assertEquals(2, inject.getAssets().size());
      assertEquals(1, inject.getAssetGroups().size());
      AssetGroup assetGroupInject = inject.getAssetGroups().getFirst();
      assertEquals(ALL_ASSETGROUP.getId(), assetGroupInject.getId());
      org.hamcrest.MatcherAssert.assertThat(
          inject.getAssets().stream().map(Asset::getId).toList(),
          org.hamcrest.Matchers.containsInAnyOrder(LINUX_X86_64.getId(), WINDOWS_X86_64.getId()));
    }

    // TODO fix the code for this case
    @DisplayName(
        "Given injectorContract matching all Windows, should create one inject with all windows assets and with all windows group")
    @Test
    void given_InjectorContractMatchingAllWindows_should_createOneInject() throws Exception {
      buildInjectorContract(
          ATTACKPATTERN,
          new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Windows},
          Payload.PAYLOAD_EXECUTION_ARCH.ALL_ARCHITECTURES);

      InjectAssistantInput input = new InjectAssistantInput();
      input.setAssetIds(List.of(WINDOWS_X86_64.getId()));
      input.setAssetGroupIds(List.of(ALL_WINDOWS.getId()));
      input.setAttackPatternIds(List.of(ATTACKPATTERN.getId()));
      input.setInjectByTTPNumber(1);

      String response =
          mvc.perform(
                  post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/assistant")
                      .content(asJsonString(input))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Set<Inject> injects = injectRepository.findByScenarioId(SCENARIO.getId());

      JSONArray jsonArray = new JSONArray(response);
      assertEquals(1, jsonArray.length());
      Inject inject = injects.stream().findFirst().get();
      assertEquals(JsonPath.read(response, "$[0].inject_id"), inject.getId());

      assertEquals(1, injects.size());
      assertEquals(1, inject.getAssets().size());
      assertEquals(1, inject.getAssetGroups().size());
      AssetGroup assetGroupInject = inject.getAssetGroups().getFirst();
      assertEquals(ALL_WINDOWS.getId(), assetGroupInject.getId());
      Asset assetInject = inject.getAssets().getFirst();
      assertEquals(WINDOWS_X86_64.getId(), assetInject.getId());
    }

    @DisplayName(
        "Given injectorContracts each matching Windows x86_64 and Windows arm64, should create two injects")
    @Test
    void given_TwoInjectorContractWindows_should_createTwoInjects() throws Exception {
      buildInjectorContract(
          ATTACKPATTERN,
          new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Windows},
          Payload.PAYLOAD_EXECUTION_ARCH.x86_64);
      buildInjectorContract(
          ATTACKPATTERN,
          new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Windows},
          Payload.PAYLOAD_EXECUTION_ARCH.arm64);

      InjectAssistantInput input = new InjectAssistantInput();
      input.setAssetIds(List.of(WINDOWS_X86_64.getId(), WINDOWS_ARM64.getId()));
      input.setAttackPatternIds(List.of(ATTACKPATTERN.getId()));
      input.setInjectByTTPNumber(1);

      String response =
          mvc.perform(
                  post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/assistant")
                      .content(asJsonString(input))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Set<Inject> injects = injectRepository.findByScenarioId(SCENARIO.getId());

      JSONArray jsonArray = new JSONArray(response);
      assertEquals(2, jsonArray.length());
      assertEquals(2, injects.size());
    }

    @DisplayName("Given injectorContracts that do not match Windows, should create manualInject")
    @Test
    void given_NoInjectorContractMatching_should_createManualInject() throws Exception {
      buildInjectorContract(
          ATTACKPATTERN,
          new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS},
          Payload.PAYLOAD_EXECUTION_ARCH.arm64);

      InjectAssistantInput input = new InjectAssistantInput();
      input.setAssetIds(List.of(LINUX_X86_64.getId()));
      input.setAssetGroupIds(List.of(ALL_WINDOWS.getId()));
      input.setAttackPatternIds(List.of(ATTACKPATTERN.getId()));
      input.setInjectByTTPNumber(1);

      String response =
          mvc.perform(
                  post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/assistant")
                      .content(asJsonString(input))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Set<Inject> injects = injectRepository.findByScenarioId(SCENARIO.getId());

      JSONArray jsonArray = new JSONArray(response);
      assertEquals(2, jsonArray.length());
      assertEquals(2, injects.size());
      injects.forEach(
          i -> {
            assertEquals(ManualContract.MANUAL_DEFAULT, i.getInjectorContract().get().getId());
            boolean hasLinuxPlatform =
                Arrays.stream(i.getInjectorContract().get().getPlatforms())
                    .anyMatch(platform -> platform == Endpoint.PLATFORM_TYPE.Linux);
            if (hasLinuxPlatform) {
              assertEquals(
                  "This placeholder is disabled because the TTP "
                      + ATTACKPATTERN.getExternalId()
                      + " with platform Linux and architecture x86_64 is currently not covered. Please create the payloads for the missing TTP",
                  i.getDescription());
            }
          });
    }

    // Test inject number per TTP
    @DisplayName("Given injectByTTPNumber to 2, should create 2 injects")
    @Test
    void given_TwoInjectByTTPNumber_should_createTwoInjects() throws Exception {
      buildInjectorContract(
          ATTACKPATTERN,
          new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Windows},
          Payload.PAYLOAD_EXECUTION_ARCH.x86_64);
      buildInjectorContract(
          ATTACKPATTERN,
          new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Windows},
          Payload.PAYLOAD_EXECUTION_ARCH.ALL_ARCHITECTURES);

      InjectAssistantInput input = new InjectAssistantInput();
      input.setAssetIds(List.of(WINDOWS_X86_64.getId()));
      input.setAttackPatternIds(List.of(ATTACKPATTERN.getId()));
      input.setInjectByTTPNumber(2);

      String response =
          mvc.perform(
                  post(SCENARIO_URI + "/" + SCENARIO.getId() + "/injects/assistant")
                      .content(asJsonString(input))
                      .contentType(MediaType.APPLICATION_JSON)
                      .accept(MediaType.APPLICATION_JSON))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();

      Set<Inject> injects = injectRepository.findByScenarioId(SCENARIO.getId());

      JSONArray jsonArray = new JSONArray(response);
      assertEquals(2, jsonArray.length());
      assertEquals(2, injects.size());
    }
  }
}
