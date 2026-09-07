package io.openaev.rest.tag_rule;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openaev.IntegrationTest;
import io.openaev.database.model.Capability;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.mockUser.WithMockUser;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestPropertySource(properties = "openaev.tenant.active-tables=tag_rules")
@WithMockUser(isAdmin = false)
@DisplayName("tag_rules isolation holds for non-admin users")
class TagRuleNonAdminIsolationTest extends IntegrationTest {

  private static final Set<Capability> TAG_RULE_READ = Set.of(Capability.ACCESS_TENANT_SETTINGS);

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;

  private String tenantA;
  private String tenantB;
  private String tenantOutsideMembership;
  private String ruleA;
  private String ruleB;

  @BeforeEach
  void seed() throws Exception {
    tenantA = tenantHelper.createTenantWithCapabilities("tag-rule-non-admin-a", TAG_RULE_READ).getId();
    tenantB = tenantHelper.createTenantWithCapabilities("tag-rule-non-admin-b", TAG_RULE_READ).getId();
    tenantOutsideMembership = tenantHelper.createTenant("tag-rule-non-admin-outside").getId();
    ruleA = seedTagRule(tenantA, "non-admin-tag-a-" + UUID.randomUUID());
    ruleB = seedTagRule(tenantB, "non-admin-tag-b-" + UUID.randomUUID());
  }

  @Test
  @DisplayName("a non-admin listing under tenant A's path sees only A's tag rules")
  void listUnderTenantAForNonAdminReturnsOnlyA() throws Exception {
    String response =
        mvc.perform(get("/api/tenants/{tenantId}/tag-rules", tenantA).with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertTrue(response.contains(ruleA), "A's tag rule must appear for a member of tenant A");
    assertFalse(response.contains(ruleB), "B's tag rule must not leak to tenant A scope");
  }

  @Test
  @DisplayName("a tenant selector outside membership is refused")
  void selectorOutsideMembershipIsRejected() throws Exception {
    mvc.perform(get("/api/tenants/{tenantId}/tag-rules", tenantOutsideMembership).with(csrf()))
        .andExpect(status().isForbidden());
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
