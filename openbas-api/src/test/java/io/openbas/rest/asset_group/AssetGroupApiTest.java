package io.openbas.rest.asset_group;

import static io.openbas.rest.asset_group.AssetGroupApi.ASSET_GROUP_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static io.openbas.utils.fixtures.AssetGroupFixture.createAssetGroupWithTags;
import static io.openbas.utils.fixtures.AssetGroupFixture.createDefaultAssetGroup;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.AssetGroupRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.asset_group.form.AssetGroupInput;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import jakarta.servlet.ServletException;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@TestInstance(PER_CLASS)
@Transactional
class AssetGroupApiTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private AssetGroupRepository assetGroupRepository;
  @Autowired private TagRepository tagRepository;

  @DisplayName("Given valid AssetGroupInput, should create assetGroup successfully")
  @Test
  @WithMockAdminUser
  void given_validAssetGroupInput_should_createAssetGroupSuccessfully() throws Exception {
    // -- PREPARE --
    Tag tag = tagRepository.save(TagFixture.getTag());
    AssetGroupInput assetGroupInput = createAssetGroupWithTags("Asset group", List.of(tag.getId()));

    // --EXECUTE--
    String response =
        mvc.perform(
                post(ASSET_GROUP_URI)
                    .content(asJsonString(assetGroupInput))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(assetGroupInput.getName(), JsonPath.read(response, "$.asset_group_name"));
    assertEquals(
        assetGroupInput.getDescription(), JsonPath.read(response, "$.asset_group_description"));
    assertEquals(tag.getId(), JsonPath.read(response, "$.asset_group_tags[0]"));
  }

  @DisplayName("Given valid AssetGroupInput, should update assetGroup successfully")
  @Test
  @WithMockAdminUser
  void given_validAssetGroupInput_should_updateAssetGroupSuccessfully() throws Exception {
    // --PREPARE--
    AssetGroup input = createDefaultAssetGroup("Asset group");
    AssetGroup assetGroup = assetGroupRepository.save(input);
    String newName = "Asset group updated";
    input.setName(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(ASSET_GROUP_URI + "/" + assetGroup.getId())
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals(newName, JsonPath.read(response, "$.asset_group_name"));
    assertEquals(input.getDescription(), JsonPath.read(response, "$.asset_group_description"));
  }

  @DisplayName(
      "Given valid AssetGroupInput for a nonexistent assetGroup, should return 404 Not Found")
  @Test
  @WithMockAdminUser
  void given_validAssetGroupInputForNonexistentAssetGroup_should_returnNotFound() throws Exception {
    // --PREPARE--
    AssetGroup input = createDefaultAssetGroup("Asset group");
    String nonexistentAssetGroupId = "nonexistent-id";
    input.setName("Asset group updated");

    // --EXECUTE--
    assertThrows(
        ServletException.class,
        () ->
            mvc.perform(
                put(ASSET_GROUP_URI + "/" + nonexistentAssetGroupId)
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)));
  }

  @DisplayName("Given existing assetGroup, should delete assetGroup successfully")
  @Test
  @WithMockAdminUser
  void given_existingAssetGroup_should_deleteAssetGroupSuccessfully() throws Exception {
    // --PREPARE--
    AssetGroup assetGroup = assetGroupRepository.save(createDefaultAssetGroup("Asset group"));

    // --EXECUTE--
    mvc.perform(
            delete(ASSET_GROUP_URI + "/" + assetGroup.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful());

    // --ASSERT--
    assertTrue(assetGroupRepository.findById(assetGroup.getId()).isEmpty());
  }
}
