package io.openaev.rest.inject;

import static io.openaev.utils.JsonTestUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openaev.IntegrationTest;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.fixtures.PaginationFixture;
import io.openaev.utils.mockUser.WithMockUser;
import jakarta.persistence.EntityManager;
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
@TestPropertySource(properties = "openaev.tenant.active-tables=injects")
@WithMockUser(isAdmin = true)
@DisplayName("injects read isolation through the real HTTP endpoint")
class InjectHttpIsolationTest extends IntegrationTest {

  private static final String INJECT_BY_ID = "/api/tenants/{tenantId}/injects/{injectId}";

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;
  @Autowired private EntityManager entityManager;

  private String tenantA;
  private String tenantB;
  private String injectA;
  private String injectB;

  @BeforeEach
  void seedTwoTenantsWithOneInjectEach() throws Exception {
    tenantA = tenantHelper.createTenantWithCurrentUser("http-iso-a").getId();
    tenantB = tenantHelper.createTenantWithCurrentUser("http-iso-b").getId();
    injectA = seedInject(tenantA, "inject-a");
    injectB = seedInject(tenantB, "inject-b");
  }

  @Test
  @DisplayName("under tenant A's path: A's inject is visible, B's is hidden")
  void given_tenantAPath_should_exposeOnlyTenantAInject() throws Exception {
    // Arrange / Act / Assert
    mvc.perform(get(INJECT_BY_ID, tenantA, injectA)).andExpect(status().isOk());
    mvc.perform(get(INJECT_BY_ID, tenantA, injectB)).andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("under tenant B's path: B's inject is visible, A's is hidden")
  void given_tenantBPath_should_exposeOnlyTenantBInject() throws Exception {
    // Arrange / Act / Assert
    mvc.perform(get(INJECT_BY_ID, tenantB, injectB)).andExpect(status().isOk());
    mvc.perform(get(INJECT_BY_ID, tenantB, injectA)).andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("via the X-Tenant-Ids header: search returns only tenant A inject")
  void given_headerScopeTenantA_should_searchOnlyTenantAInject() throws Exception {
    // Arrange
    String body = asJsonString(PaginationFixture.getDefault().textSearch("").build());

    // Act
    String response =
        mvc.perform(
                post("/api/injects/search")
                    .header("X-Tenant-Ids", tenantA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    // Assert
    assertTrue(response.contains(injectA), "tenant A inject must appear when A is selected");
    assertFalse(response.contains(injectB), "tenant B inject must not appear");
  }

  private String seedInject(String tenantId, String title) {
    String id = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO injects"
                + " (inject_id, tenant_id, inject_title, inject_all_teams, inject_enabled,"
                + " inject_depends_duration, inject_collect_status, inject_created_at, inject_updated_at)"
                + " VALUES (:id, :tenant, :title, false, true, 0, 'COLLECTING', now(), now())")
        .setParameter("id", id)
        .setParameter("tenant", tenantId)
        .setParameter("title", title)
        .executeUpdate();
    return id;
  }
}
