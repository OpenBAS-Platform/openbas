package io.openbas.rest;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.utils.fixtures.*;
import io.openbas.utils.fixtures.composers.*;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Nullable;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
@Transactional
public class AtomicTestingApiTest extends IntegrationTest {

  public static final String ATOMIC_TESTINGS_URI = "/api/atomic-testings";

  static Inject INJECT_WITH_STATUS_AND_COMMAND_LINES;
  static Inject INJECT_WITHOUT_STATUS;
  static InjectStatus INJECT_STATUS;
  static InjectorContract INJECTOR_CONTRACT;

  @Autowired private AgentComposer agentComposer;
  @Autowired private EndpointComposer endpointComposer;
  @Autowired private InjectComposer injectComposer;
  @Autowired private InjectStatusComposer injectStatusComposer;
  @Autowired private ExecutorFixture executorFixture;

  @Autowired private MockMvc mvc;
  @Autowired private InjectRepository injectRepository;
  @Autowired private InjectorContractRepository injectorContractRepository;
  @Autowired private InjectStatusRepository injectStatusRepository;
  @Autowired private EntityManager entityManager;

  @BeforeEach
  void before() {
    INJECTOR_CONTRACT = injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow();
    Inject injectWithoutPayload = InjectFixture.getInjectForEmailContract(INJECTOR_CONTRACT);
    INJECT_WITHOUT_STATUS = injectRepository.save(injectWithoutPayload);

    Inject injectWithPayload = InjectFixture.getInjectForEmailContract(INJECTOR_CONTRACT);
    INJECT_WITH_STATUS_AND_COMMAND_LINES = injectRepository.save(injectWithPayload);
    InjectStatus injectStatus = InjectStatusFixture.createPendingInjectStatus();
    injectStatus.setInject(injectWithPayload);
    INJECT_STATUS = injectStatusRepository.save(injectStatus);
  }

  private Inject getAtomicTesting(
      @Nullable InjectStatus injectStatus, @Nullable Executor executor) {
    InjectStatus injectStatusToSet =
        (injectStatus == null) ? InjectStatusFixture.createDraftInjectStatus() : injectStatus;
    Executor executorToRun = (executor == null) ? executorFixture.getDefaultExecutor() : executor;
    return injectComposer
        .forInject(InjectFixture.getDefaultInject())
        .withEndpoint(
            endpointComposer
                .forEndpoint(EndpointFixture.createEndpoint())
                .withAgent(
                    agentComposer.forAgent(AgentFixture.createDefaultAgentSession(executorToRun))))
        .withInjectStatus(injectStatusComposer.forInjectStatus(injectStatusToSet))
        .persist()
        .get();
  }

  @Test
  @DisplayName("Find an atomic testing without status")
  @WithMockAdminUser
  void findAnAtomicTestingWithoutStatus() throws Exception {
    String response =
        mvc.perform(
                get(ATOMIC_TESTINGS_URI + "/" + INJECT_WITHOUT_STATUS.getId())
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
  @DisplayName("Find an atomic testing with status and command lines")
  @WithMockAdminUser
  void findAnAtomicTestingWithStatusAndCommandLines() throws Exception {
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
  @DisplayName("Duplicate and delete an atomic testing")
  @WithMockAdminUser
  void duplicateAndDeleteAtomicTesting() throws Exception {
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
  @DisplayName("Launch an Atomic Testing")
  @WithMockAdminUser
  void launchAtomicTesting() throws Exception {
    Inject atomicTesting = getAtomicTesting(null, null);

    entityManager.flush();
    entityManager.clear();

    mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + atomicTesting.getId() + "/launch"))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.inject_status.status_name").value("QUEUING"));
  }

  @Test
  @DisplayName("Relaunch an Atomic Testing")
  @WithMockAdminUser
  void relaunchAtomicTesting() throws Exception {
    Inject atomicTesting = getAtomicTesting(InjectStatusFixture.createQueuingInjectStatus(), null);

    String relaunchedInject =
        mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + atomicTesting.getId() + "/relaunch"))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.inject_status.status_name").value("QUEUING"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    String relaunchedInjectId = JsonPath.read(relaunchedInject, "$.inject_id");
    mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + atomicTesting.getId()))
        .andExpect(status().is4xxClientError());
    mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + relaunchedInjectId))
        .andExpect(status().is2xxSuccessful());
  }

  @Nested
  @DisplayName("Lock Atomic testing EE feature")
  @WithMockAdminUser
  class LockAtomicTestingEEFeature {
    @Test
    @DisplayName("Throw license restricted error when launch with crowdstrike")
    void given_crowdstrike_should_not_LaunchAtomicTesting() throws Exception {
      Inject atomicTesting = getAtomicTesting(null, executorFixture.getCrowdstrikeExecutor());

      mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + atomicTesting.getId() + "/launch"))
          .andExpect(status().isForbidden())
          .andExpect(jsonPath("$.message").value("LICENSE_RESTRICTION"));
    }

    @Test
    @DisplayName("Throw license restricted error when relaunch with Tanium")
    void given_tanium_should_not_relaunchAtomicTesting() throws Exception {
      Inject atomicTesting =
          getAtomicTesting(
              InjectStatusFixture.createQueuingInjectStatus(), executorFixture.getTaniumExecutor());

      mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + atomicTesting.getId() + "/relaunch"))
          .andExpect(status().isForbidden())
          .andExpect(jsonPath("$.message").value("LICENSE_RESTRICTION"));
    }
  }

  @Test
  @DisplayName("Get the payload of an atomic testing")
  @WithMockAdminUser
  void findPayloadOutputByInjectId() throws Exception {
    String response =
        mvc.perform(
                get(ATOMIC_TESTINGS_URI
                        + "/"
                        + INJECT_WITH_STATUS_AND_COMMAND_LINES.getId()
                        + "/payload")
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertEquals("", response);
  }
}
