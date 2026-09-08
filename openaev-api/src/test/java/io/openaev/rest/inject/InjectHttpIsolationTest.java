package io.openaev.rest.inject;

import static io.openaev.config.TenantUriUtils.TENANT_PREFIX;
import static io.openaev.rest.inject.InjectApi.INJECT_URI;
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
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestPropertySource(properties = "openaev.tenant.active-tables=injects")
@WithMockUser(isAdmin = true)
@DisplayName("injects read isolation through real HTTP endpoints")
class InjectHttpIsolationTest extends IntegrationTest {

  private static final String TENANT_INJECT_BY_ID = TENANT_PREFIX + "/injects/{injectId}";
  private static final String INJECT_BY_ID = INJECT_URI + "/{injectId}";

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;

  private String tenantA;
  private String tenantB;
  private String injectA;
  private String injectB;

  @BeforeEach
  void seedTwoTenantsWithOneInjectEach() throws Exception {
    tenantA = tenantHelper.createTenantWithCurrentUser("inject-http-iso-a").getId();
    tenantB = tenantHelper.createTenantWithCurrentUser("inject-http-iso-b").getId();
    injectA = seedInject(tenantA, "inject-a");
    injectB = seedInject(tenantB, "inject-b");
  }

  @Nested
  @DisplayName("tenant-path isolation")
  class TenantPathIsolation {

    @Test
    void given_tenantA_path_should_return_only_tenantA_inject() throws Exception {
      // Arrange / Act / Assert
      mvc.perform(get(TENANT_INJECT_BY_ID, tenantA, injectA)).andExpect(status().isOk());
      mvc.perform(get(TENANT_INJECT_BY_ID, tenantA, injectB)).andExpect(status().isNotFound());
    }

    @Test
    void given_tenantB_path_should_return_only_tenantB_inject() throws Exception {
      // Arrange / Act / Assert
      mvc.perform(get(TENANT_INJECT_BY_ID, tenantB, injectB)).andExpect(status().isOk());
      mvc.perform(get(TENANT_INJECT_BY_ID, tenantB, injectA)).andExpect(status().isNotFound());
    }
  }

  @Nested
  @DisplayName("header-path isolation")
  class HeaderPathIsolation {

    @Test
    void given_header_scope_tenantA_should_hide_tenantB_inject() throws Exception {
      // Arrange / Act
      String responseA =
          mvc.perform(get(INJECT_BY_ID, injectA).header("X-Tenant-Ids", tenantA))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // Assert
      assertTrue(responseA.contains(injectA), "tenant A inject id must be present");
      assertFalse(responseA.contains(injectB), "tenant B inject id must not be present");
      mvc.perform(get(INJECT_BY_ID, injectB).header("X-Tenant-Ids", tenantA))
          .andExpect(status().isNotFound());
    }
  }

  private String seedInject(String tenantId, String title) {
    String id = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO injects (inject_id, inject_title, inject_enabled, inject_all_teams, inject_depends_duration,"
                + " inject_created_at, inject_updated_at, tenant_id)"
                + " VALUES (:id, :title, true, false, 0, now(), now(), :tenantId)")
        .setParameter("id", id)
        .setParameter("title", title)
        .setParameter("tenantId", tenantId)
        .executeUpdate();
    return id;
  }
}
