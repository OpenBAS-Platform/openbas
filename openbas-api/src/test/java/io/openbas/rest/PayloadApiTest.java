package io.openbas.rest;

import io.openbas.IntegrationTest;
import io.openbas.database.model.Document;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Payload;
import io.openbas.database.repository.DocumentRepository;
import io.openbas.rest.payload.form.PayloadCreateInput;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestInstance(PER_CLASS)
public class PayloadApiTest extends IntegrationTest {

    private static final String PAYLOAD_URI = "/api/payloads";
    private static Document EXECUTABLE_FILE;

    @Autowired
    private MockMvc mvc;
    @Autowired
    private DocumentRepository documentRepository;

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
    }
    @Test
    @DisplayName("Create Executable Payload")
    @WithMockAdminUser
    void createExecutablePayload() throws Exception {
        PayloadCreateInput input = new PayloadCreateInput();
        input.setType("Executable");
        input.setName("My Executable Payload");
        input.setSource(Payload.PAYLOAD_SOURCE.MANUAL);
        input.setStatus(Payload.PAYLOAD_STATUS.VERIFIED);
        input.setPlatforms(new Endpoint.PLATFORM_TYPE[]{Endpoint.PLATFORM_TYPE.Linux});
        input.setAttackPatternsIds(Collections.emptyList());
        input.setTagIds(Collections.emptyList());
        input.setExecutableArch(Endpoint.PLATFORM_ARCH.x86_64);
        input.setExecutableFile(EXECUTABLE_FILE.getId());

        mvc.perform(post(PAYLOAD_URI)
            .contentType(MediaType.APPLICATION_JSON)
            .content(asJsonString(input)))
            .andExpect(status().is2xxSuccessful())
            .andExpect(jsonPath("$.executable_arch").value("x86_64"));
    }
}
