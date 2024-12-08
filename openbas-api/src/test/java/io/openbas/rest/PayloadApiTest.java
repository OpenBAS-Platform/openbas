package io.openbas.rest;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Document;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Payload;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.rest.collector.form.CollectorCreateInput;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import io.openbas.rest.payload.form.PayloadUpsertInput;
import io.openbas.rest.payload.form.PayloadsDeprecateInput;
import io.openbas.utils.fixtures.PayloadInputFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.annotation.Resource;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
class PayloadApiTest extends IntegrationTest {

  private static final String PAYLOAD_URI = "/api/payloads";
  private static Document EXECUTABLE_FILE;

  @Autowired private MockMvc mvc;
  @Autowired private DocumentRepository documentRepository;
  @Autowired private PayloadRepository payloadRepository;

  @Resource private ObjectMapper objectMapper;

  @BeforeAll
  void beforeAll() {
    EXECUTABLE_FILE = documentRepository.save(PayloadInputFixture.createDefaultExecutableFile());
  }

  @AfterAll
  void afterAll() {
    this.documentRepository.deleteAll(List.of(EXECUTABLE_FILE));
    this.payloadRepository.deleteAll();
  }

  @Test
  @DisplayName("Create Executable Payload")
  @WithMockAdminUser
  void createExecutablePayload() throws Exception {
    PayloadCreateInput input = PayloadInputFixture.createDefaultPayloadCreateInputForExecutable();
    input.setExecutableFile(EXECUTABLE_FILE.getId());

    mvc.perform(
            post(PAYLOAD_URI).contentType(MediaType.APPLICATION_JSON).content(asJsonString(input)))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.payload_name").value("My Executable Payload"))
        .andExpect(jsonPath("$.payload_description").value("Executable description"))
        .andExpect(jsonPath("$.payload_source").value("MANUAL"))
        .andExpect(jsonPath("$.payload_status").value("VERIFIED"))
        .andExpect(jsonPath("$.payload_platforms.[0]").value("Linux"))
        .andExpect(jsonPath("$.executable_arch").value("x86_64"));
  }

  @Test
  @DisplayName("Creating an Executable Payload without Arch should fail")
  @WithMockAdminUser
  void createExecutablePayloadWithoutArch() throws Exception {
    PayloadCreateInput input = PayloadInputFixture.createDefaultPayloadCreateInputForExecutable();
    input.setExecutableFile(EXECUTABLE_FILE.getId());
    input.setExecutableArch(null);

    mvc.perform(
            post(PAYLOAD_URI).contentType(MediaType.APPLICATION_JSON).content(asJsonString(input)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Update Executable Payload")
  @WithMockAdminUser
  void updateExecutablePayload() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForExecutable();
    createInput.setExecutableFile(EXECUTABLE_FILE.getId());

    String response =
        mvc.perform(
                post(PAYLOAD_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(createInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.payload_name").value("My Executable Payload"))
            .andExpect(jsonPath("$.payload_platforms.[0]").value("Linux"))
            .andExpect(jsonPath("$.executable_arch").value("x86_64"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var payloadId = JsonPath.read(response, "$.payload_id");

    PayloadUpdateInput updateInput = new PayloadUpdateInput();
    updateInput.setName("My Updated Executable Payload");
    updateInput.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    updateInput.setExecutableArch(Endpoint.PLATFORM_ARCH.arm64);
    updateInput.setExecutableFile(EXECUTABLE_FILE.getId());

    mvc.perform(
            put(PAYLOAD_URI + "/" + payloadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateInput)))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.payload_name").value("My Updated Executable Payload"))
        .andExpect(jsonPath("$.payload_platforms.[0]").value("MacOS"))
        .andExpect(jsonPath("$.executable_arch").value("arm64"));
  }

  @Test
  @DisplayName("Updating an Executable Payload without arch should fail")
  @WithMockAdminUser
  void updateExecutablePayloadWithoutArch() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForExecutable();
    createInput.setExecutableFile(EXECUTABLE_FILE.getId());

    String response =
        mvc.perform(
                post(PAYLOAD_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(createInput)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var payloadId = JsonPath.read(response, "$.payload_id");

    PayloadUpdateInput updateInput = new PayloadUpdateInput();
    updateInput.setName("My Updated Executable Payload");
    updateInput.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.MacOS});
    updateInput.setExecutableFile(EXECUTABLE_FILE.getId());

    mvc.perform(
            put(PAYLOAD_URI + "/" + payloadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateInput)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Creating Command Line payload with both set executor and content should succeed")
  @WithMockAdminUser
  void createCommandLinePayloadWithBothSetExecutorAndContent() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForCommandLine();

    createInput.setExecutor("sh");
    createInput.setExecutor("echo hello world");

    mvc.perform(
            post(PAYLOAD_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createInput)))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName(
      "Creating Command Line payload with both null cleanup executor and command should succeed")
  @WithMockAdminUser
  void createCommandLinePayloadWithBothNullCleanupExecutorAndCommand() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForCommandLine();

    createInput.setCleanupExecutor(null);
    createInput.setCleanupCommand(null);

    mvc.perform(
            post(PAYLOAD_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createInput)))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName(
      "Creating Command Line payload with both set cleanup executor and command should succeed")
  @WithMockAdminUser
  void createCommandLinePayloadWithBothSetCleanupExecutorAndCommand() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForCommandLine();

    createInput.setCleanupExecutor("sh");
    createInput.setCleanupCommand("cleanup this mess");

    mvc.perform(
            post(PAYLOAD_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createInput)))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName(
      "Creating Command Line payload with only set cleanup executor and null command should fail")
  @WithMockAdminUser
  void createCommandLinePayloadWithOnlySetCleanupExecutorAndNullCommand() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForCommandLine();

    createInput.setCleanupExecutor("sh");
    createInput.setCleanupCommand(null);

    mvc.perform(
            post(PAYLOAD_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createInput)))
        .andExpect(status().isConflict());
  }

  @Test
  @DisplayName(
      "Creating Command Line payload with only set cleanup command and null executor should fail")
  @WithMockAdminUser
  void createCommandLinePayloadWithOnlySetCommandAndNullExecutor() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForCommandLine();

    createInput.setCleanupExecutor(null);
    createInput.setCleanupCommand("cleanup this mess");

    mvc.perform(
            post(PAYLOAD_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createInput)))
        .andExpect(status().isConflict());
  }

  @Test
  @DisplayName(
      "Updating Command Line payload with only set cleanup command and null executor should fail")
  @WithMockAdminUser
  void updateCommandLinePayloadWithOnlySetCommandAndNullExecutor() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForCommandLine();

    createInput.setCleanupExecutor(null);
    createInput.setCleanupCommand(null);

    String response =
        mvc.perform(
                post(PAYLOAD_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(createInput)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    var payloadId = JsonPath.read(response, "$.payload_id");

    PayloadUpdateInput updateInput = new PayloadUpdateInput();
    updateInput.setName("updated command line payload");
    updateInput.setContent("echo world again");
    updateInput.setExecutor("sh");
    updateInput.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});

    updateInput.setCleanupCommand("cleanup this mess");

    mvc.perform(
            put(PAYLOAD_URI + "/" + payloadId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateInput)))
        .andExpect(status().isConflict());
  }

  @Test
  @DisplayName(
      "Duplicating a Community and Verified Payload should result in a Manual and Unverified Payload")
  @WithMockAdminUser
  void duplicateExecutablePayload() throws Exception {
    PayloadCreateInput createInput =
        PayloadInputFixture.createDefaultPayloadCreateInputForExecutable();
    createInput.setExecutableFile(EXECUTABLE_FILE.getId());
    createInput.setSource(Payload.PAYLOAD_SOURCE.COMMUNITY);
    createInput.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);

    String createdPayload =
        mvc.perform(
                post(PAYLOAD_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(createInput)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.payload_name").value("My Executable Payload"))
            .andExpect(jsonPath("$.payload_platforms.[0]").value("Linux"))
            .andExpect(jsonPath("$.executable_arch").value("x86_64"))
            .andExpect(jsonPath("$.payload_source").value("COMMUNITY"))
            .andExpect(jsonPath("$.payload_status").value("VERIFIED"))
            .andReturn()
            .getResponse()
            .getContentAsString();

    var payloadId = JsonPath.read(createdPayload, "$.payload_id");

    mvc.perform(post(PAYLOAD_URI + "/" + payloadId + "/duplicate"))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.payload_name").value("My Executable Payload (duplicate)"))
        .andExpect(jsonPath("$.payload_platforms.[0]").value("Linux"))
        .andExpect(jsonPath("$.executable_arch").value("x86_64"))
        .andExpect(jsonPath("$.payload_source").value("MANUAL"))
        .andExpect(jsonPath("$.payload_status").value("UNVERIFIED"));
  }

  @Test
  @DisplayName("Process Deprecated Payloads")
  @WithMockAdminUser
  void processDeprecatedPayloads() throws Exception {
    String collectorId = "039eee9b-b95d-4b11-95bb-a9ac233f1738";
    CollectorCreateInput collectorCreateInput = new CollectorCreateInput();
    collectorCreateInput.setId(collectorId);
    collectorCreateInput.setName("My Collector");
    collectorCreateInput.setType("openbas_atomic_red_team");

    MockMultipartFile inputMultipart =
        new MockMultipartFile(
            "input",
            null,
            "application/json",
            objectMapper.writeValueAsString(collectorCreateInput).getBytes());

    mvc.perform(multipart("/api/collectors").file(inputMultipart))
        .andExpect(status().is2xxSuccessful());

    PayloadUpsertInput payloadUpsertInput1 =
        PayloadInputFixture.createDefaultPayloadUpsertInputForCommandLine();
    payloadUpsertInput1.setCollector(collectorId);
    payloadUpsertInput1.setExternalId("54e03fc3-e906-4b8e-865a-972e3e339d60");

    PayloadUpsertInput payloadUpsertInput2 =
        PayloadInputFixture.createDefaultPayloadUpsertInputForCommandLine();
    payloadUpsertInput2.setName("Command Payload 2");
    payloadUpsertInput2.setCollector(collectorId);
    payloadUpsertInput2.setExternalId("7a1ecc3c-3201-45cb-9a93-58405c0a680d");

    String upsertedPayload1 =
        mvc.perform(
                post(PAYLOAD_URI + "/upsert")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(payloadUpsertInput1)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String payloadId1 = JsonPath.read(upsertedPayload1, "$.payload_id");

    String upsertedPayload2 =
        mvc.perform(
                post(PAYLOAD_URI + "/upsert")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(payloadUpsertInput2)))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String payloadId2 = JsonPath.read(upsertedPayload2, "$.payload_id");

    PayloadsDeprecateInput payloadsDeprecateInput =
        new PayloadsDeprecateInput(collectorId, List.of(payloadUpsertInput2.getExternalId()));

    mvc.perform(
            post(PAYLOAD_URI + "/deprecate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(payloadsDeprecateInput)))
        .andExpect(status().is2xxSuccessful());

    mvc.perform(get(PAYLOAD_URI + "/" + payloadId1))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.payload_name").value("Command line payload"))
        .andExpect(jsonPath("$.payload_collector").value(collectorId))
        .andExpect(jsonPath("$.payload_status").value("DEPRECATED"));

    mvc.perform(get(PAYLOAD_URI + "/" + payloadId2))
        .andExpect(status().is2xxSuccessful())
        .andExpect(jsonPath("$.payload_name").value("Command Payload 2"))
        .andExpect(jsonPath("$.payload_collector").value(collectorId))
        .andExpect(jsonPath("$.payload_status").value("UNVERIFIED"));
  }
}
