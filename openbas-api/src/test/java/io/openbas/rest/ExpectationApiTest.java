package io.openbas.rest;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.*;
import io.openbas.rest.atomic_testing.form.AtomicTestingInput;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
public class ExpectationApiTest extends IntegrationTest {

  public static final String API_EXPECTATIONS = "/api/expectations/";
  public static final String API_INJECTS_EXPECTATIONS = "/api/injects/expectations";

  static Inject

  @Autowired private MockMvc mvc;
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectStatusRepository injectStatusRepository;
  @Autowired private InjectExpectationRepository injectExpectationRepository;

  @BeforeAll
  void beforeAll() {
    Inject inject = injectRepository.save(InjectFixture.createInject());
    AssetGroup assetGroup = AssetGroupFixture.createDefaultAssetGroup();
    Asset asset = AssetFixture.createDefaultAsset();
    Agent agent = AgentFixture.createAgent();

    InjectExpectation detectionInjectExpectation = injectExpectationRepository.save(InjectExpectationFixture.createDetectionInjectExpectation());
    InjectExpectation preventionInjectExpectation = injectExpectationRepository.save(InjectExpectationFixture.createPreventionInjectExpectation());
  }

  @Test
  @DisplayName("Update expectation result")
  void updateInjectExpectation() throws Exception {
    String response =
        mvc.perform(
                put(API_EXPECTATIONS + "/" + injectExpectation.getId())
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(INJECT_WITHOUT_STATUS.getId(), JsonPath.read(response, "$.inject_id"));
  }

  @Test
  @DisplayName("Delete expectation result")
  void deleteInjectExpectationResult() throws Exception {
    String response =
        mvc.perform(
                put(API_EXPECTATIONS + "/" + injectExpectation.getId())
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(INJECT_WITHOUT_STATUS.getId(), JsonPath.read(response, "$.inject_id"));
  }

  @Test
  @DisplayName("Get Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectExpectationsAssetsNotFilledForSource() throws Exception {
    String response =
        mvc.perform(
                get(ATOMIC_TESTINGS_URI + "/" + INJECT_WITH_STATUS_AND_COMMAND_LINES.getId())
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(
        INJECT_WITH_STATUS_AND_COMMAND_LINES.getId(), JsonPath.read(response, "$.inject_id"));
  }

  @Test
  @DisplayName("Get Prevention Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectPreventionExpectationsNotFilledForSource() throws Exception {
    // Duplicate
    String response =
        mvc.perform(
                post(ATOMIC_TESTINGS_URI + "/" + INJECT_WITHOUT_STATUS.getId() + "/duplicate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertNotNull(response);
    // Assert duplicate
    String newInjectId = JsonPath.read(response, "$.inject_id");
    response =
        mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + newInjectId).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(newInjectId, JsonPath.read(response, "$.inject_id"));
    // Delete
    mvc.perform(delete(ATOMIC_TESTINGS_URI + "/" + newInjectId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());
    // Assert delete
    mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + newInjectId).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is4xxClientError());
  }

  @Test
  @DisplayName("Get Detection Inject Expectations for a Specific Source")
  @WithMockAdminUser
  void getInjectDetectionExpectationsNotFilledForSource() throws Exception {
    AtomicTestingInput atomicTestingInput =
        AtomicTestingInputFixture.createDefaultAtomicTestingInput();
    atomicTestingInput.setInjectorContract(INJECTOR_CONTRACT.getId());

    String createdInject =
        mvc.perform(
                post(ATOMIC_TESTINGS_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(atomicTestingInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.inject_status.status_name").value("DRAFT"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    String injectId = JsonPath.read(createdInject, "$.inject_id");

    mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + injectId + "/launch"))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.inject_status.status_name").value("QUEUING"));
  }

  @Test
  @DisplayName("Update Inject expectation")
  @WithMockAdminUser
  void updateInjectExpectation() throws Exception {
    AtomicTestingInput atomicTestingInput =
        AtomicTestingInputFixture.createDefaultAtomicTestingInput();
    atomicTestingInput.setInjectorContract(INJECTOR_CONTRACT.getId());

    String createdInject =
        mvc.perform(
                post(ATOMIC_TESTINGS_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(atomicTestingInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.inject_status.status_name").value("DRAFT"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    String injectId = JsonPath.read(createdInject, "$.inject_id");

    mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + injectId + "/launch"))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.inject_status.status_name").value("QUEUING"));

    String relaunchedInject =
        mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + injectId + "/relaunch"))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.inject_status.status_name").value("QUEUING"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    String relaunchedInjectId = JsonPath.read(relaunchedInject, "$.inject_id");

    mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + injectId)).andExpect(status().is4xxClientError());

    mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + relaunchedInjectId))
        .andExpect(status().is2xxSuccessful());
  }

  @AfterAll
  void afterAll() {
    injectStatusRepository.deleteAll();
    injectRepository.deleteAll();
  }
}
