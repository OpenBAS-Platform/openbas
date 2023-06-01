package io.openex.rest.zone;

import com.fasterxml.jackson.core.type.TypeReference;
import io.openex.database.model.System;
import io.openex.database.model.Zone;
import io.openex.database.repository.SystemRepository;
import io.openex.database.repository.ZoneRepository;
import io.openex.rest.utils.WithMockObserverUser;
import io.openex.rest.utils.WithMockPlannerUser;
import io.openex.rest.zone.form.UpdateSystemsZoneInput;
import io.openex.rest.zone.form.ZoneInput;
import org.hamcrest.Matchers;
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
import static io.openex.rest.utils.JsonUtils.asJsonString;
import static io.openex.rest.utils.JsonUtils.asStringJson;
import static io.openex.rest.zone.ZoneApi.ZONE_URI;
import static java.util.List.of;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class ZoneApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ZoneRepository zoneRepository;
    @Autowired
    private SystemRepository systemRepository;

    @AfterAll
    public void teardown() {
        this.zoneRepository.deleteAll();
        this.systemRepository.deleteAll();
    }

    @Test
    @Order(1)
    @WithMockUser(roles={"ADMIN"})
    void createZoneTest() throws Exception {
        // Prepare
        ZoneInput zoneInput = new ZoneInput();
        zoneInput.setName("Zone");

        // Execute
        String response = this.mvc
                .perform(post(ZONE_URI)
                        .content(asJsonString(zoneInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Zone zoneResponse = asStringJson(response, Zone.class);

        // Assert
        assertEquals("Zone", zoneResponse.getName());
    }

    @Test
    @Order(2)
    @WithMockObserverUser
    void zonesTest() throws Exception {
        // Execute
        String response = this.mvc
                .perform(get(ZONE_URI).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        List<Zone> zonesResponse = asStringJson(response, new TypeReference<>() {
        });

        // Assert
        assertEquals(1, zonesResponse.size());
    }

    @Test
    @Order(3)
    @WithMockPlannerUser
    void systemsTestForbidden() throws Exception {
        // Execute & Assert
        this.mvc.perform(get(ZONE_URI).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @Order(4)
    @WithMockUser(roles={"ADMIN"})
    void updateZoneTest() throws Exception {
        // Prepare
        Zone zoneResponse = getFirstZone();
        ZoneInput zoneInput = new ZoneInput();
        zoneInput.setName("Change zone name");

        // Execute
        String response = this.mvc
                .perform(put(ZONE_URI + "/" + zoneResponse.getId())
                        .content(asJsonString(zoneInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        zoneResponse = asStringJson(response, Zone.class);

        // Assert
        assertEquals("Change zone name", zoneResponse.getName());
    }

    @Test
    @Order(5)
    @WithMockUser(roles={"ADMIN"})
    void addSystemToZoneTest() throws Exception {
        // Prepare
        Zone zoneResponse = getFirstZone();
        System system = new System();
        system.setName("System");
        system.setType(ENDPOINT);
        system.setIp("127.0.0.1");
        system.setHostname("hostname");
        system.setOs(LINUX);
        system = this.systemRepository.save(system);
        UpdateSystemsZoneInput input = new UpdateSystemsZoneInput();
        input.setSystemIds(of(system.getId()));

        // Execute
        String response = this.mvc.perform(put(ZONE_URI + "/" + zoneResponse.getId() + "/systems")
                        .content(asJsonString(input))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Assert
        assertTrue(response.contains(system.getId()));
    }

    @Test
    @Order(6)
    @WithMockObserverUser
    void zoneSystemsTest() throws Exception {
        // Prepare
        Zone zoneResponse = getFirstZone();

        // Execute & Assert
        this.mvc.perform(get(ZONE_URI + "/" + zoneResponse.getId() + "/systems")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andExpect(jsonPath("$", Matchers.not(Matchers.emptyArray())));
    }

    @Test
    @Order(7)
    @WithMockUser(roles={"ADMIN"})
    void deleteZoneTest() throws Exception {
        // Prepare
        Zone zoneResponse = getFirstZone();

        // Execute
        this.mvc.perform(delete(ZONE_URI + "/" + zoneResponse.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful());

        // Assert
        assertEquals(0, this.zoneRepository.count());
    }

    // -- PRIVATE --

    private Zone getFirstZone() {
        return this.zoneRepository.findAll().iterator().next();
    }

}
