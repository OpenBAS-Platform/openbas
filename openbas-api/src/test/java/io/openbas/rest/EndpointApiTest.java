package io.openbas.rest;

import static io.openbas.rest.asset.endpoint.EndpointApi.ENDPOINT_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.asset.EndpointService;
import io.openbas.database.model.Agent;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.asset.endpoint.form.EndpointInput;
import io.openbas.rest.asset.endpoint.form.EndpointRegisterInput;
import io.openbas.utils.fixtures.EndpointFixture;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;

import java.util.List;

import org.junit.jupiter.api.*;
import org.mockito.Spy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(PER_CLASS)
public class EndpointApiTest {

  static EndpointInput ENDPOINT_INPUT;
  static EndpointRegisterInput ENDPOINT_REGISTER_INPUT;
  static Endpoint ENDPOINT;
  static String TAG_ID;

  @Autowired
  private MockMvc mvc;
  @Autowired
  private TagRepository tagRepository;
  @Autowired
  private EndpointRepository endpointRepository;
  @Spy
  private EndpointService endpointService;

  @BeforeEach
  void beforeEach() {
    Tag tag = tagRepository.save(TagFixture.getTag());
    TAG_ID = tag.getId();
  }

  @AfterEach
  void afterEach() {
    tagRepository.deleteById(TAG_ID);
  }

  @DisplayName("Creation of a windows endpoint")
  @Test
  @WithMockAdminUser
  void createWindowsEndpointTest() throws Exception {
    // --PREPARE--
    ENDPOINT_INPUT = EndpointFixture.createWindowsEndpointInput(List.of(TAG_ID));

    // --EXECUTE--
    String response =
        mvc.perform(
                post(ENDPOINT_URI)
                    .content(asJsonString(ENDPOINT_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("Windows Hostname", JsonPath.read(response, "$.endpoint_hostname"));

    // --THEN--
    endpointRepository.deleteById(JsonPath.read(response, "$.endpoint_hostname"));
  }

  @DisplayName("Upsert of an endpoint")
  @Test
  @WithMockAdminUser
  void upsertEndpointTest() throws Exception {
    // --PREPARE--
    ENDPOINT_REGISTER_INPUT = EndpointFixture.createWindowsEndpointRegisterInput(List.of(TAG_ID), "external01");
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(ENDPOINT_REGISTER_INPUT);
    Agent agent = new Agent();
    agent.setExecutedByUser(Agent.ADMIN_SYSTEM_WINDOWS);
    agent.setPrivilege(Agent.PRIVILEGE.admin);
    agent.setDeploymentMode(Agent.DEPLOYMENT_MODE.service);
    agent.setAsset(endpoint);
    agent.setExternalReference("external01");
    endpoint.setAgents(List.of(agent));
    ENDPOINT = endpointRepository.save(endpoint);

    String newName = "New hostname";
    ENDPOINT_REGISTER_INPUT.setHostname(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                post(ENDPOINT_URI + "/register")
                    .content(asJsonString(ENDPOINT_REGISTER_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    endpointService.generateUpgradeCommand(String.valueOf(Endpoint.PLATFORM_TYPE.Windows));

    // --ASSERT--
    assertEquals("New hostname", JsonPath.read(response, "$.endpoint_hostname"));
    // --THEN--
    endpointRepository.deleteById(JsonPath.read(response, "$.asset_id"));
  }

  @DisplayName("Edition of an endpoint")
  @Test
  @WithMockAdminUser
  void updateEndpointTest() throws Exception {
    // --PREPARE--
    ENDPOINT_INPUT = EndpointFixture.createWindowsEndpointInput(List.of(TAG_ID));
    Endpoint endpoint = new Endpoint();
    endpoint.setUpdateAttributes(ENDPOINT_INPUT);
    Agent agent = new Agent();
    agent.setExecutedByUser(Agent.ADMIN_SYSTEM_WINDOWS);
    agent.setPrivilege(Agent.PRIVILEGE.admin);
    agent.setDeploymentMode(Agent.DEPLOYMENT_MODE.service);
    agent.setAsset(endpoint);
    endpoint.setAgents(List.of(agent));
    ENDPOINT = endpointRepository.save(endpoint);

    String newName = "New hostname";
    ENDPOINT_INPUT.setHostname(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(ENDPOINT_URI + "/" + ENDPOINT.getId())
                    .content(asJsonString(ENDPOINT_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("New hostname", JsonPath.read(response, "$.endpoint_hostname"));
    // --THEN--
    endpointRepository.deleteById(JsonPath.read(response, "$.asset_id"));
  }
}
