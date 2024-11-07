package io.openbas.rest;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Document;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Payload;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.database.repository.PayloadRepository;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.rest.payload.form.PayloadUpdateInput;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@TestInstance(PER_CLASS)
public class PayloadApiTest extends IntegrationTest {

  private static final String PAYLOAD_URI = "/api/payloads";
  private static Document EXECUTABLE_FILE;

  @Autowired private MockMvc mvc;
  @Autowired private DocumentRepository documentRepository;
  @Autowired private PayloadRepository payloadRepository;

  @BeforeAll
  void beforeAll() {
    Document executableFile = new Document();
    executableFile.setName("Executable file");
    executableFile.setType("text/x-sh");
    EXECUTABLE_FILE = documentRepository.save(executableFile);
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
    PayloadCreateInput input = getExecutablePayloadCreateInput();

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
    PayloadCreateInput input = getExecutablePayloadCreateInput();
    input.setExecutableArch(null);

    mvc.perform(
            post(PAYLOAD_URI).contentType(MediaType.APPLICATION_JSON).content(asJsonString(input)))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("Update Executable Payload")
  @WithMockAdminUser
  void updateExecutablePayload() throws Exception {
    PayloadCreateInput createInput = getExecutablePayloadCreateInput();

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
    PayloadCreateInput createInput = getExecutablePayloadCreateInput();

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
  @DisplayName("Creating Command Line payload with both null executor and content should fail")
  @WithMockAdminUser
  void createCommandLinePayloadWithBothNullExecutorAndContent() throws Exception {
    PayloadCreateInput createInput = getCommandLinePayloadCreateInput();

    createInput.setExecutor(null);
    createInput.setContent(null);

    mvc.perform(
            post(PAYLOAD_URI)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(createInput)))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("Creating Command Line payload with both set executor and content should succeed")
  @WithMockAdminUser
  void createCommandLinePayloadWithBothSetExecutorAndContent() throws Exception {
    PayloadCreateInput createInput = getCommandLinePayloadCreateInput();

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
    PayloadCreateInput createInput = getCommandLinePayloadCreateInput();

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
    PayloadCreateInput createInput = getCommandLinePayloadCreateInput();

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
    PayloadCreateInput createInput = getCommandLinePayloadCreateInput();

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
    PayloadCreateInput createInput = getCommandLinePayloadCreateInput();

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
    PayloadCreateInput createInput = getCommandLinePayloadCreateInput();

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

  private PayloadCreateInput getExecutablePayloadCreateInput() {
    PayloadCreateInput input = new PayloadCreateInput();
    input.setType("Executable");
    input.setName("My Executable Payload");
    input.setDescription("Executable description");
    input.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
    input.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});
    input.setAttackPatternsIds(Collections.emptyList());
    input.setTagIds(Collections.emptyList());
    input.setExecutableFile(EXECUTABLE_FILE.getId());
    input.setExecutableArch(Endpoint.PLATFORM_ARCH.x86_64);
    return input;
  }

  private PayloadCreateInput getCommandLinePayloadCreateInput() {
    PayloadCreateInput input = new PayloadCreateInput();
    input.setType("Command");
    input.setName("Command line payload");
    input.setDescription("This does something, maybe");
    input.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
    input.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);
    input.setPlatforms(new Endpoint.PLATFORM_TYPE[] {Endpoint.PLATFORM_TYPE.Linux});
    input.setAttackPatternsIds(Collections.emptyList());
    input.setTagIds(Collections.emptyList());

    input.setExecutor("bash");
    input.setContent("echo hello");
    return input;
  }
}
