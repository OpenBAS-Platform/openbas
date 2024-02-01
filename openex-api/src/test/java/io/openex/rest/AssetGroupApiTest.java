package io.openex.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import io.openex.database.model.AssetGroup;
import io.openex.database.repository.AssetGroupRepository;
import io.openex.database.repository.EndpointRepository;
import io.openex.rest.asset_group.form.AssetGroupInput;
import io.openex.rest.utils.WithMockObserverUser;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static io.openex.rest.asset_group.AssetGroupApi.ASSET_GROUP_URI;
import static io.openex.rest.utils.JsonUtils.asJsonString;
import static io.openex.rest.utils.JsonUtils.asStringJson;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(OrderAnnotation.class)
@TestInstance(PER_CLASS)
public class AssetGroupApiTest {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private AssetGroupRepository assetGroupRepository;
  @Autowired
  private EndpointRepository endpointRepository;

  static String ASSET_GROUP_ID;

  @AfterAll
  public void teardown() {
    this.assetGroupRepository.deleteAll();
    this.endpointRepository.deleteAll();
  }

  @DisplayName("Create asset group succeed")
  @Test
  @Order(1)
  @WithMockUser(roles = {"ADMIN"})
  void createAssetGroupTest() throws Exception {
    // -- PREPARE --
    AssetGroupInput assetGroupInput = new AssetGroupInput();
    String name = "Zone";
    assetGroupInput.setName(name);

    // -- EXECUTE --
    String response = this.mvc
        .perform(post(ASSET_GROUP_URI)
            .content(asJsonString(assetGroupInput))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    AssetGroup assetGroupResponse = asStringJson(response, AssetGroup.class);
    ASSET_GROUP_ID = assetGroupResponse.getId();

    // -- ASSERT --
    assertEquals(name, assetGroupResponse.getName());
  }

  @DisplayName("Retrieve asset groups succeed")
  @Test
  @Order(2)
  @WithMockObserverUser
  void retrieveAssetGroupsTest() throws Exception {
    // -- EXECUTE --
    String response = this.mvc
        .perform(get(ASSET_GROUP_URI).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    List<AssetGroup> assetGroupsResponse = asStringJson(response, new TypeReference<>() {
    });

    // -- ASSERT --
    assertEquals(1, assetGroupsResponse.size());
  }

  @DisplayName("Retrieve asset group succeed")
  @Test
  @Order(3)
  @WithMockObserverUser
  void retrieveAssetGroupTest() throws Exception {
    // -- EXECUTE --
    String response = this.mvc
        .perform(get(ASSET_GROUP_URI + "/" + ASSET_GROUP_ID).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    AssetGroup assetGroupResponse = asStringJson(response, new TypeReference<>() {
    });

    // -- ASSERT --
    assertNotNull(assetGroupResponse);
  }

  @DisplayName("Update asset group succeed")
  @Test
  @Order(4)
  @WithMockUser(roles = {"ADMIN"})
  void updateGroupAssetTest() throws Exception {
    // -- PREPARE --
    AssetGroup assetGroupReponse = getFirstAssetGroup();
    AssetGroupInput assetGroupInput = new AssetGroupInput();
    String name = "Change zone name";
    assetGroupInput.setName(name);

    // -- EXECUTE --
    String response = this.mvc
        .perform(put(ASSET_GROUP_URI + "/" + assetGroupReponse.getId())
            .content(asJsonString(assetGroupInput))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();
    assetGroupReponse = asStringJson(response, AssetGroup.class);

    // -- ASSERT --
    assertEquals(name, assetGroupReponse.getName());
  }

  @DisplayName("Delete asset group failed")
  @Test
  @Order(5)
  @WithMockObserverUser
  void deleteAssetGroupFailedTest() throws Exception {
    // -- PREPARE --
    AssetGroup assetGroupReponse = getFirstAssetGroup();

    // -- EXECUTE & ASSERT --
    this.mvc.perform(delete(ASSET_GROUP_URI + "/" + assetGroupReponse.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is4xxClientError());
  }

  @DisplayName("Delete asset group succeed")
  @Test
  @Order(6)
  @WithMockUser(roles = {"ADMIN"})
  void deleteAssetGroupSucceedTest() throws Exception {
    // -- PREPARE --
    AssetGroup assetGroupReponse = getFirstAssetGroup();

    // -- EXECUTE --
    this.mvc.perform(delete(ASSET_GROUP_URI + "/" + assetGroupReponse.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    // -- ASSERT --
    assertEquals(0, this.assetGroupRepository.count());
  }

  // -- PRIVATE --

  private AssetGroup getFirstAssetGroup() {
    return this.assetGroupRepository.findAll().iterator().next();
  }

}
