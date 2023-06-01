package io.openex.rest.system;

import com.fasterxml.jackson.core.type.TypeReference;
import io.openex.database.model.System;
import io.openex.database.repository.SystemRepository;
import io.openex.rest.system.form.SystemInput;
import io.openex.rest.utils.WithMockObserverUser;
import io.openex.rest.utils.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static io.openex.database.model.System.OS_TYPE.LINUX;
import static io.openex.database.model.System.SYSTEM_TYPE.ENDPOINT;
import static io.openex.rest.system.SystemApi.SYSTEM_URI;
import static io.openex.rest.utils.JsonUtils.asJsonString;
import static io.openex.rest.utils.JsonUtils.asStringJson;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class SystemApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private SystemRepository systemRepository;

    @AfterAll
    void teardown() {
        this.systemRepository.deleteAll();
    }

    @Test
    @Order(1)
    @WithMockUser(roles={"ADMIN"})
    void createSystemTest() throws Exception {
        // Prepare
        SystemInput systemInput = new SystemInput();
        systemInput.setName("System");
        systemInput.setType(ENDPOINT.name());
        systemInput.setIp("127.0.0.1");
        systemInput.setHostname("hostname");
        systemInput.setOs(LINUX.name());

        // Execute
        String response = this.mvc
                .perform(post(SYSTEM_URI)
                        .content(asJsonString(systemInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        System systemResponse = asStringJson(response, System.class);

        // Assert
        assertEquals("System", systemResponse.getName());
    }

    @Test
    @Order(2)
    @WithMockObserverUser
    void systemsTestSuccess() throws Exception {
        // Execute
        String response = this.mvc
                .perform(get(SYSTEM_URI).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        List<System> systemsResponse = asStringJson(response, new TypeReference<>() {
        });

        // Assert
        assertEquals(1, systemsResponse.size());
    }

    @Test
    @Order(3)
    @WithMockPlannerUser
    void systemsTestForbidden() throws Exception {
        // Execute & Assert
        this.mvc.perform(get(SYSTEM_URI).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @Order(4)
    @WithMockUser(roles={"ADMIN"})
    void updateSystemTest() throws Exception {
        // Prepare
        System systemResponse = getFirstSystem();
        SystemInput systemInput = new SystemInput();
        systemInput.setName("Change system name");
        systemInput.setType(systemResponse.getType().name());
        systemInput.setIp(systemResponse.getIp());
        systemInput.setHostname(systemResponse.getHostname());
        systemInput.setOs(systemResponse.getOs().name());

        // Execute
        String response = this.mvc
                .perform(put(SYSTEM_URI + "/" + systemResponse.getId())
                        .content(asJsonString(systemInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        systemResponse = asStringJson(response, System.class);

        // Assert
        assertEquals("Change system name", systemResponse.getName());
    }

    @Test
    @Order(5)
    @WithMockUser(roles={"ADMIN"})
    void deleteSystemTest() throws Exception {
        // Prepare
        System systemResponse = getFirstSystem();

        // Execute
        this.mvc.perform(delete(SYSTEM_URI + "/" + systemResponse.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful());

        // Assert
        assertEquals(0, this.systemRepository.count());
    }

    // -- PRIVATE --

    private System getFirstSystem() {
        return this.systemRepository.findAll().iterator().next();
    }

}
