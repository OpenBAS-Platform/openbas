package io.openaev.rest.domain;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openaev.IntegrationTest;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.mockUser.WithMockUser;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestPropertySource(properties = "openaev.tenant.active-tables=domains")
@WithMockUser(isAdmin = false)
@DisplayName("domains isolation and tenant membership checks for a non-admin")
class DomainNonAdminIsolationTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;

  private String tenantA;
  private String tenantB;
  private String outsiderTenant;
  private String domainA;
  private String domainB;

  @BeforeEach
  void seedTenants() throws Exception {
    tenantA = tenantHelper.createTenantWithCurrentUser("domain-nonadmin-a").getId();
    tenantB = tenantHelper.createTenantWithCurrentUser("domain-nonadmin-b").getId();
    outsiderTenant = tenantHelper.createTenant("domain-nonadmin-outsider").getId();
    domainA = seedDomain(tenantA, "nonadmin-a");
    domainB = seedDomain(tenantB, "nonadmin-b");
  }

  @Test
  @DisplayName("a non-admin user sees only scoped tenant data")
  void nonAdminListIsScoped() throws Exception {
    String response =
        mvc.perform(get("/api/tenants/{tenantId}/domains", tenantA))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertTrue(response.contains(domainA), "A's domain must appear");
    assertFalse(response.contains(domainB), "B's domain must not leak into A's scope");
  }

  @Test
  @DisplayName("a non-admin user cannot select a tenant they do not belong to")
  void nonAdminCannotSelectOutOfRightsTenant() throws Exception {
    mvc.perform(get("/api/tenants/{tenantId}/domains", outsiderTenant))
        .andExpect(status().isForbidden());
  }

  private String seedDomain(String tenantId, String name) {
    String id = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO domains (domain_id, domain_name, domain_color, tenant_id)"
                + " VALUES (?1, ?2, ?3, ?4)")
        .setParameter(1, id)
        .setParameter(2, name)
        .setParameter(3, "#778899")
        .setParameter(4, tenantId)
        .executeUpdate();
    return id;
  }
}
