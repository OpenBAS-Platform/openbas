package io.openaev.rest.tag;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openaev.IntegrationTest;
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
@TestPropertySource(properties = "openaev.tenant.active-tables=tags")
@WithMockUser(isAdmin = false)
@DisplayName("tags isolation holds for a non-admin spanning two tenants")
class TagNonAdminIsolationTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;

  private String tenantA;
  private String tenantC;
  private String tagA;
  private String tagB;

  @BeforeEach
  void seedTwoTenantsTheNonAdminBelongsToWithOneTagEach() throws Exception {
    tenantA = tenantHelper.createTenantWithCapabilities("nonadmin-tag-a", Set.of()).getId();
    String tenantB = tenantHelper.createTenantWithCapabilities("nonadmin-tag-b", Set.of()).getId();
    tenantC = tenantHelper.createTenant("nonadmin-tag-c").getId();
    tagA = seedTag(tenantA, "nonadmin-tag-a", "#111111");
    tagB = seedTag(tenantB, "nonadmin-tag-b", "#222222");
    seedTag(tenantC, "nonadmin-tag-c", "#333333");
  }

  @Test
  @DisplayName("a non-admin listing under tenant A's path sees only A's tag")
  void listUnderTenantAReturnsOnlyAForNonAdmin() throws Exception {
    String response =
        mvc.perform(get("/api/tenants/{tenantId}/tags", tenantA).with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    assertTrue(response.contains(tagA), "A's tag must appear for the non-admin member of A");
    assertFalse(response.contains(tagB), "B's tag must not leak to A's scope");
  }

  @Test
  @DisplayName("a non-admin using an out-of-rights tenant selector is forbidden")
  void tenantSelectorOutOfRightsIsForbidden() throws Exception {
    mvc.perform(get("/api/tenants/{tenantId}/tags", tenantC).with(csrf()))
        .andExpect(status().isForbidden());
  }

  private String seedTag(String tenantId, String name, String color) {
    String id = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO tags (tag_id, tag_name, tag_color, tenant_id) VALUES (?1, ?2, ?3, ?4)")
        .setParameter(1, id)
        .setParameter(2, name)
        .setParameter(3, color)
        .setParameter(4, tenantId)
        .executeUpdate();
    return id;
  }
}
