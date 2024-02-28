package io.openbas.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Endpoint;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import io.openbas.rest.utils.WithMockObserverUser;
import io.openbas.rest.utils.WithMockPlannerUser;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static io.openbas.database.model.Endpoint.PLATFORM_TYPE.Linux;
import static io.openbas.rest.asset.endpoint.EndpointApi.ENDPOINT_URI;
import static io.openbas.rest.utils.JsonUtils.asJsonString;
import static io.openbas.rest.utils.JsonUtils.asStringJson;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(OrderAnnotation.class)
@TestInstance(PER_CLASS)
class EndpointApiTest extends IntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private EndpointRepository endpointRepository;

    @AfterAll
    void teardown() {
        this.endpointRepository.deleteAll();
    }

    @DisplayName("Create endpoint succeed")
    @Test
    @Order(1)
    @WithMockPlannerUser
    void createEndpointTest() throws Exception {
        // -- PREPARE --
        EndpointInput endpointInput = new EndpointInput();
        String name = "Personal PC";
        endpointInput.setName(name);
        endpointInput.setIps(new String[]{"127.0.0.1"});
        endpointInput.setHostname("hostname");
        endpointInput.setPlatform(Linux);

        // -- EXECUTE --
        String response = this.mvc
                .perform(post(ENDPOINT_URI)
                        .content(asJsonString(endpointInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Endpoint endpointResponse = asStringJson(response, Endpoint.class);

        // -- ASSERT --
        assertEquals(name, endpointResponse.getName());
    }

    @DisplayName("Retrieve endpoint succeed")
    @Test
    @Order(2)
    @WithMockObserverUser
    void retrieveEndpointTest() throws Exception {
        // -- EXECUTE --
        String response = this.mvc
                .perform(get(ENDPOINT_URI).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        List<Endpoint> endpoints = asStringJson(response, new TypeReference<>() {
        });

        // -- ASSERT --
        assertEquals(1, endpoints.size());
    }

    @DisplayName("Update endpoint succeed")
    @Test
    @Order(3)
    @WithMockPlannerUser
    void updateEndpointTest() throws Exception {
        // -- PREPARE --
        Endpoint endpointResponse = getFirstEndpoint();
        EndpointInput endpointInput = new EndpointInput();
        String name = "Professional PC";
        endpointInput.setName(name);
        endpointInput.setIps(endpointResponse.getIps());
        endpointInput.setHostname(endpointResponse.getHostname());
        endpointInput.setPlatform(endpointResponse.getPlatform());

        // -- EXECUTE --
        String response = this.mvc
                .perform(put(ENDPOINT_URI + "/" + endpointResponse.getId())
                        .content(asJsonString(endpointInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful())
                .andReturn()
                .getResponse()
                .getContentAsString();
        endpointResponse = asStringJson(response, Endpoint.class);

        // -- ASSERT --
        assertEquals(name, endpointResponse.getName());
    }


    @DisplayName("Delete endpoint failed")
    @Test
    @Order(3)
    @WithMockObserverUser
    void deleteEndpointFailedTest() throws Exception {
        // -- PREPARE --
        Endpoint endpointResponse = getFirstEndpoint();

        // -- EXECUTE & ASSERT --
        this.mvc.perform(delete(ENDPOINT_URI + "/" + endpointResponse.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is4xxClientError());
    }

    @DisplayName("Delete endpoint succeed")
    @Test
    @Order(5)
    @WithMockPlannerUser
    void deleteEndpointSucceedTest() throws Exception {
        // -- PREPARE --
        Endpoint endpointResponse = getFirstEndpoint();

        // -- EXECUTE --
        this.mvc.perform(delete(ENDPOINT_URI + "/" + endpointResponse.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().is2xxSuccessful());

        // -- ASSERT --
        assertEquals(0, this.endpointRepository.count());
    }

    // -- PRIVATE --

    private Endpoint getFirstEndpoint() {
        return this.endpointRepository.findAll().iterator().next();
    }

}
