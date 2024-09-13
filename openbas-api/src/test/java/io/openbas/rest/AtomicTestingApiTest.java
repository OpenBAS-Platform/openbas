package io.openbas.rest;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectRepository;
import io.openbas.database.repository.InjectStatusRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.utils.mockUser.WithMockAdminUser;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static io.openbas.injectors.email.EmailContract.EMAIL_DEFAULT;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;

@TestInstance(PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AtomicTestingApiTest extends IntegrationTest {

    public static final String ATOMIC_TESTINGS_URI = "/api/atomic_testings";

    static Inject INJECT_WITH_PAYLOAD;
    static Inject INJECT_WITHOUT_PAYLOAD;
    static InjectStatus INJECT_STATUS;
    static String NEW_INJECT_ID;

    @Autowired
    private MockMvc mvc;
    @Autowired
    private InjectRepository injectRepository;
    @Autowired
    private InjectorContractRepository injectorContractRepository;
    @Autowired
    private InjectStatusRepository injectStatusRepository;

    @BeforeAll
    void beforeAll() {
        Inject injectToCreate1 = new Inject();
        injectToCreate1.setTitle("Inject without payload");
        injectToCreate1.setCreatedAt(Instant.now());
        injectToCreate1.setUpdatedAt(Instant.now());
        injectToCreate1.setDependsDuration(0L);
        injectToCreate1.setEnabled(true);
        injectToCreate1.setInjectorContract(injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
        INJECT_WITHOUT_PAYLOAD = injectRepository.save(injectToCreate1);

        Inject injectToCreate2 = new Inject();
        injectToCreate2.setTitle("Inject with payload");
        injectToCreate2.setCreatedAt(Instant.now());
        injectToCreate2.setUpdatedAt(Instant.now());
        injectToCreate2.setDependsDuration(0L);
        injectToCreate2.setEnabled(true);
        injectToCreate2.setInjectorContract(injectorContractRepository.findById(EMAIL_DEFAULT).orElseThrow());
        INJECT_WITH_PAYLOAD = injectRepository.save(injectToCreate2);
        InjectStatus injectStatus = new InjectStatus();
        injectStatus.setInject(injectToCreate2);
        injectStatus.setTrackingSentDate(Instant.now());
        injectStatus.setName(ExecutionStatus.SUCCESS);
        injectStatus.setCommandsLines(new InjectStatusCommandLine(List.of("cmd"), List.of("clean cmd"), "id1234567"));
        INJECT_STATUS = injectStatusRepository.save(injectStatus);
    }

    @DisplayName("Find an atomic testing without payload")
    @Test
    @WithMockAdminUser
    @Order(1)
    void findAnAtomicTestingTestWithoutPayload() throws Exception {
        String response = mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + INJECT_WITHOUT_PAYLOAD.getId())
                .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        // -- ASSERT --
        assertNotNull(response);
        assertEquals(INJECT_WITHOUT_PAYLOAD.getId(), JsonPath.read(response, "$.inject_id"));
        assertNull(JsonPath.read(response, "$.inject_commands_lines"));
    }

    @DisplayName("Find an atomic testing with payload")
    @Test
    @WithMockAdminUser
    @Order(2)
    void findAnAtomicTestingTestWithPayload() throws Exception {
        String response = mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + INJECT_WITH_PAYLOAD.getId())
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        // -- ASSERT --
        assertNotNull(response);
        assertEquals(INJECT_WITH_PAYLOAD.getId(), JsonPath.read(response, "$.inject_id"));
        assertNotNull(JsonPath.read(response, "$.inject_commands_lines"));
    }

    @DisplayName("Duplicate and delete an atomic testing")
    @Test
    @WithMockAdminUser
    @Order(3)
    void duplicateAndDeleteAtomicTestingTest() throws Exception {
        // Duplicate
        String response = mvc.perform(post(ATOMIC_TESTINGS_URI + "/" + INJECT_WITHOUT_PAYLOAD.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertNotNull(response);
        // Assert duplicate
        NEW_INJECT_ID = JsonPath.read(response, "$.inject_id");
        response = mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + NEW_INJECT_ID)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertEquals(NEW_INJECT_ID, JsonPath.read(response, "$.inject_id"));
        // Delete
        response = mvc.perform(delete(ATOMIC_TESTINGS_URI + "/" + NEW_INJECT_ID)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertNotNull(response);
        // Assert delete
        response = mvc.perform(get(ATOMIC_TESTINGS_URI + "/" + NEW_INJECT_ID)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertNotNull(response);
    }

    @AfterAll
    void afterAll() {
        injectStatusRepository.delete(INJECT_STATUS);
        injectRepository.delete(INJECT_WITH_PAYLOAD);
        injectRepository.delete(INJECT_WITHOUT_PAYLOAD);
    }

}
