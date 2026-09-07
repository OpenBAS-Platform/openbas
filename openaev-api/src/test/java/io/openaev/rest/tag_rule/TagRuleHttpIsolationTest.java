package io.openaev.rest.tag_rule;

import static io.openaev.utils.JsonTestUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openaev.IntegrationTest;
import io.openaev.rest.tag_rule.form.TagRuleInput;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.mockUser.WithMockUser;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestPropertySource(properties = "openaev.tenant.active-tables=tag_rules")
@WithMockUser(isAdmin = true)
@DisplayName("tag_rules read and write isolation through the real HTTP endpoint")
class TagRuleHttpIsolationTest extends IntegrationTest {

  private static final String TENANT_TAG_RULES = "/api/tenants/{tenantId}/tag-rules";
  private static final String TENANT_TAG_RULE_BY_ID = TENANT_TAG_RULES + "/{tagRuleId}";

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;

  private String tenantA;
  private String tenantB;
  private String ruleA;
  private String ruleB;
  private String tagNameA;

  @BeforeEach
  void seedTwoTenantsWithOneTagRuleEach() throws Exception {
    tenantA = tenantHelper.createTenantWithCurrentUser("tag-rule-iso-a").getId();
    tenantB = tenantHelper.createTenantWithCurrentUser("tag-rule-iso-b").getId();
    tagNameA = "tag-a-" + UUID.randomUUID();
    String tagNameB = "tag-b-" + UUID.randomUUID();
    ruleA = seedTagRule(tenantA, tagNameA);
    ruleB = seedTagRule(tenantB, tagNameB);
  }

  @Test
  @DisplayName("under tenant A's path: A's tag rule is visible, B's is hidden")
  void underTenantAPath() throws Exception {
    mvc.perform(get(TENANT_TAG_RULE_BY_ID, tenantA, ruleA)).andExpect(status().isOk());
    mvc.perform(get(TENANT_TAG_RULE_BY_ID, tenantA, ruleB)).andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("via the X-Tenant-Ids header: list returns only A's tag rule")
  void listViaHeaderReturnsOnlyA() throws Exception {
    String response =
        mvc.perform(get("/api/tag-rules").header("X-Tenant-Ids", tenantA).with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertTrue(response.contains(ruleA), "A's tag rule must appear");
    assertFalse(response.contains(ruleB), "B's tag rule must not appear");
  }

  @Test
  @DisplayName("a create under tenant A's path is attributed to tenant A")
  void createUnderTenantAIsAttributedToA() throws Exception {
    TagRuleInput input = TagRuleInput.builder().tagName(tagNameA).assetGroups(List.of()).build();
    String response =
        mvc.perform(
                post(TENANT_TAG_RULES, tenantA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(input))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String createdId = JsonPath.read(response, "$.tag_rule_id");
    String storedTenant =
        (String)
            entityManager
                .createNativeQuery("SELECT tenant_id FROM tag_rules WHERE tag_rule_id = :id")
                .setParameter("id", createdId)
                .getSingleResult();
    assertEquals(tenantA, storedTenant, "the created tag rule must belong to tenant A");
  }

  @Test
  @DisplayName("a create with no tenant selector is refused")
  void createWithoutSelectorIsRejected() throws Exception {
    TagRuleInput input = TagRuleInput.builder().tagName(tagNameA).assetGroups(List.of()).build();
    mvc.perform(
            post("/api/tag-rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input))
                .with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("under tenant A's path: updating B's tag rule is not found and leaves it untouched")
  void updateUnderTenantAOfBTagRuleIsBlocked() throws Exception {
    TagRuleInput input = TagRuleInput.builder().tagName(tagNameA).assetGroups(List.of()).build();
    mvc.perform(
            put(TENANT_TAG_RULE_BY_ID, tenantA, ruleB)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input))
                .with(csrf()))
        .andExpect(status().isNotFound());
    assertEquals(1L, rawCount(ruleB), "B's tag rule must remain untouched");
  }

  @Test
  @DisplayName("under tenant A's path: deleting B's tag rule is a no-op and leaves it in place")
  void deleteUnderTenantAOfBTagRuleIsBlocked() throws Exception {
    mvc.perform(delete(TENANT_TAG_RULE_BY_ID, tenantA, ruleB).with(csrf()))
        .andExpect(status().isNotFound());
    assertEquals(1L, rawCount(ruleB), "B's tag rule must survive tenant A's delete attempt");
  }

  private long rawCount(String tagRuleId) {
    entityManager.flush();
    Number count =
        (Number)
            entityManager
                .createNativeQuery("SELECT count(*) FROM tag_rules WHERE tag_rule_id = :id")
                .setParameter("id", tagRuleId)
                .getSingleResult();
    return count.longValue();
  }

  private String seedTagRule(String tenantId, String tagName) {
    String tagId = UUID.randomUUID().toString();
    String tagRuleId = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO tags (tag_id, tag_name, tag_color, tag_created_at, tag_updated_at, tenant_id)"
                + " VALUES (:tagId, :name, :color, now(), now(), :tenantId)")
        .setParameter("tagId", tagId)
        .setParameter("name", tagName)
        .setParameter("color", "#123456")
        .setParameter("tenantId", tenantId)
        .executeUpdate();
    entityManager
        .createNativeQuery(
            "INSERT INTO tag_rules (tag_rule_id, tag_id, tag_rule_protected, tenant_id)"
                + " VALUES (:ruleId, :tagId, false, :tenantId)")
        .setParameter("ruleId", tagRuleId)
        .setParameter("tagId", tagId)
        .setParameter("tenantId", tenantId)
        .executeUpdate();
    return tagRuleId;
  }
}
