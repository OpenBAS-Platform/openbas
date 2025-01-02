package io.openbas.rest.asset_group;

import static io.openbas.rest.asset_group.AssetGroupApi.ASSET_GROUP_URI;
import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Tag;
import io.openbas.database.repository.AssetGroupRepository;
import io.openbas.database.repository.TagRepository;
import io.openbas.rest.asset_group.form.AssetGroupInput;
import io.openbas.utils.fixtures.AssetGroupFixture;
import io.openbas.utils.fixtures.TagFixture;
import io.openbas.utils.mockUser.WithMockAdminUser;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(PER_CLASS)
public class AssetGroupTest {

  static AssetGroupInput ASSET_GROUP_INPUT;
  static String TAG_ID;

  @Autowired private MockMvc mvc;

  @Autowired private AssetGroupRepository assetGroupRepository;

  @Autowired private TagRepository tagRepository;

  @BeforeEach
  void beforeEach() {
    Tag tag = tagRepository.save(TagFixture.getTag());
    TAG_ID = tag.getId();

    ASSET_GROUP_INPUT = AssetGroupFixture.createAssetGroupWithTags("Asset group", List.of(TAG_ID));
  }

  @AfterEach
  void afterEach() {
    tagRepository.deleteById(TAG_ID);
  }

  @DisplayName("Creation of an asset group")
  @Test
  @WithMockAdminUser
  void createAssetGroupTest() throws Exception {
    // --EXECUTE--
    String response =
        mvc.perform(
                post(ASSET_GROUP_URI)
                    .content(asJsonString(ASSET_GROUP_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("Asset group", JsonPath.read(response, "$.asset_group_name"));

    // --THEN--
    assetGroupRepository.deleteById(JsonPath.read(response, "$.asset_group_id"));
  }

  @DisplayName("Edition of an asset group")
  @Test
  @WithMockAdminUser
  void updateAssetGroupTest() throws Exception {
    // --PREPARE--
    AssetGroup assetGroup =
        assetGroupRepository.save(AssetGroupFixture.createDefaultAssetGroup("Asset group"));
    String newName = "Asset group updated";
    ASSET_GROUP_INPUT.setName(newName);

    // --EXECUTE--
    String response =
        mvc.perform(
                put(ASSET_GROUP_URI + "/" + assetGroup.getId())
                    .content(asJsonString(ASSET_GROUP_INPUT))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // --ASSERT--
    assertEquals("Asset group updated", JsonPath.read(response, "$.asset_group_name"));
    // --THEN--
    assetGroupRepository.deleteById(JsonPath.read(response, "$.asset_group_id"));
  }
}
