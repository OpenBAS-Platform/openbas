package io.openbas.rest.tag_rule;

import static io.openbas.utils.JsonUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.TestInstance.Lifecycle.PER_CLASS;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openbas.IntegrationTest;
import io.openbas.database.model.Asset;
import io.openbas.database.model.Tag;
import io.openbas.database.model.TagRule;
import io.openbas.database.repository.*;
import io.openbas.rest.tag_rule.form.TagRuleInput;
import io.openbas.utils.mockUser.WithMockAdminUser;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@TestInstance(PER_CLASS)
public class TagRuleApiTest extends IntegrationTest {

  public static final String TAG_RULE_URI = "/api/tag-rules";

  @Autowired private MockMvc mvc;

  @Autowired private AssetRepository assetRepository;
  @Autowired private TagRepository tagRepository;
  @Autowired private TagRuleRepository tagRuleRepository;

  @AfterEach
  void afterEach() {
    tagRuleRepository.deleteAll();
    tagRepository.deleteAll();
    assetRepository.deleteAll();
  }

  @Test
  @WithMockAdminUser
  void findTagRule() throws Exception {
    String assetName = "assetName";
    String tagId = "tagName";
    TagRule expected = createTagRule(tagId, List.of(assetName));

    String response =
        mvc.perform(get(TAG_RULE_URI + "/" + expected.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(expected.getId(), JsonPath.read(response, "$.tag_rule_id"));
    assertEquals(expected.getTag().getName(), JsonPath.read(response, "$.tag_name"));
    Map<String, Object> tagRuleAssets = JsonPath.read(response, "$.tag_rule_assets");
    assertTrue(tagRuleAssets.containsKey(expected.getAssets().getFirst().getId()));
  }

  @Test
  @WithMockAdminUser
  void deleteTagRule() throws Exception {
    String assetName = "assetName";
    String tagId = "tagName";
    TagRule expected = createTagRule(tagId, List.of(assetName));
    mvc.perform(delete(TAG_RULE_URI + "/" + expected.getId()).accept(MediaType.APPLICATION_JSON))
        .andExpect(status().is2xxSuccessful())
        .andReturn()
        .getResponse()
        .getContentAsString();

    assertFalse(tagRuleRepository.existsById(expected.getId()));
  }

  @Test
  @WithMockAdminUser
  void deleteTagRule_WITH_unexisting_id() throws Exception {
    mvc.perform(delete(TAG_RULE_URI + "/" + "randomid").accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound())
        .andReturn()
        .getResponse()
        .getContentAsString();
  }

  @Test
  @WithMockAdminUser
  void createTagRule_with_nonExistingTag() throws Exception {

    String assetId = "assetId";
    String tagName = "tagName";
    TagRuleInput input = TagRuleInput.builder().tagName(tagName).assets(List.of(assetId)).build();
    mvc.perform(
            post(TAG_RULE_URI)
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockAdminUser
  void createTagRule() throws Exception {

    Asset asset = createAsset("assetName");
    Tag tag = createTag("tagName");
    TagRuleInput input =
        TagRuleInput.builder().tagName(tag.getName()).assets(List.of(asset.getId())).build();

    String response =
        mvc.perform(
                post(TAG_RULE_URI)
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(tag.getName(), JsonPath.read(response, "$.tag_name"));
    Map<String, Object> tagRuleAssets = JsonPath.read(response, "$.tag_rule_assets");
    assertTrue(tagRuleAssets.containsKey(asset.getId()));
  }

  @Test
  @WithMockAdminUser
  void updateTagRule() throws Exception {

    String assetName1 = "assetName1";
    String assetName2 = "assetName2";
    Tag tag = createTag("tagName");
    TagRule toUpdate = createTagRule(tag.getName(), List.of(assetName1));
    Asset asset2 = createAsset(assetName2);

    TagRuleInput input =
        TagRuleInput.builder().tagName(tag.getName()).assets(List.of(asset2.getId())).build();

    String response =
        mvc.perform(
                put(TAG_RULE_URI + "/" + toUpdate.getId())
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(tag.getName(), JsonPath.read(response, "$.tag_name"));
    Map<String, Object> tagRuleAssets = JsonPath.read(response, "$.tag_rule_assets");
    assertTrue(tagRuleAssets.containsKey(asset2.getId()));
  }

  @Test
  @WithMockAdminUser
  void updateTagRule_WITH_non_existing_tag() throws Exception {

    String assetName1 = "assetName1";
    String assetName2 = "assetName2";
    Tag tag = createTag("tagName");
    TagRule toUpdate = createTagRule(tag.getName(), List.of(assetName1));
    Asset asset2 = createAsset(assetName2);

    TagRuleInput input =
        TagRuleInput.builder().tagName("randomtagname").assets(List.of(asset2.getId())).build();

    mvc.perform(
            put(TAG_RULE_URI + "/" + toUpdate.getId())
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockAdminUser
  void updateTagRule_WITH_non_existing_id() throws Exception {

    String assetName1 = "assetName1";
    String assetName2 = "assetName2";
    Tag tag = createTag("tagName");
    createTagRule(tag.getName(), List.of(assetName1));
    Asset asset2 = createAsset(assetName2);

    TagRuleInput input =
        TagRuleInput.builder().tagName(tag.getName()).assets(List.of(asset2.getId())).build();

    mvc.perform(
            put(TAG_RULE_URI + "/" + "randomid")
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockAdminUser
  void updateTagRule_WITH_non_existing_asset() throws Exception {

    String assetName1 = "assetName1";
    Tag tag = createTag("tagName");
    TagRule toUpdate = createTagRule(tag.getName(), List.of(assetName1));

    TagRuleInput input =
        TagRuleInput.builder().tagName(tag.getName()).assets(List.of("randomasset")).build();

    mvc.perform(
            put(TAG_RULE_URI + "/" + toUpdate.getId())
                .content(asJsonString(input))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  @WithMockAdminUser
  void findAllTagRules() throws Exception {
    TagRule tagRule1 = createTagRule("tag1", List.of("asset1"));
    TagRule tagRule2 = createTagRule("tag2", List.of("asset2"));
    String response =
        mvc.perform(
                get(TAG_RULE_URI)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertNotNull(response);
    List<Object> tagRuleList = JsonPath.read(response, "$");
    assertEquals(2, tagRuleList.size());
    assertEquals(tagRule1.getId(), JsonPath.read(response, "$[0].tag_rule_id"));
    assertEquals(tagRule2.getId(), JsonPath.read(response, "$[1].tag_rule_id"));
  }

  @Test
  @WithMockAdminUser
  void searchTagRule() throws Exception {
    createTagRule("tag1", List.of("asset1"));
    createTagRule("tag2", List.of("asset2"));
    createTagRule("tag3", List.of("asset3"));
    createTagRule("tag4", List.of("asset4"));

    SearchPaginationInput input = new SearchPaginationInput();
    input.setSize(2);
    input.setPage(0);

    String response =
        mvc.perform(
                post(TAG_RULE_URI + "/search")
                    .content(asJsonString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().is2xxSuccessful())
            .andReturn()
            .getResponse()
            .getContentAsString();
    // -- ASSERT --
    assertNotNull(response);
    assertEquals(Integer.valueOf(2), JsonPath.read(response, "$.numberOfElements"));
    assertEquals(Integer.valueOf(4), JsonPath.read(response, "$.totalElements"));
  }

  private TagRule createTagRule(String tagName, List<String> assetNames) {
    TagRule tagRule = new TagRule();
    tagRule.setId(tagName);
    tagRule.setTag(createTag(tagName));
    assetNames.forEach(assetName -> tagRule.getAssets().add(createAsset(assetName)));
    return tagRuleRepository.save(tagRule);
  }

  private Tag createTag(String tagName) {
    Tag tag = new Tag();
    tag.setName(tagName + System.currentTimeMillis());
    tag.setColor("#0000");
    return tagRepository.save(tag);
  }

  private Asset createAsset(String assetName) {
    Asset asset = new Asset();
    asset.setName(assetName);
    return assetRepository.save(asset);
  }
}