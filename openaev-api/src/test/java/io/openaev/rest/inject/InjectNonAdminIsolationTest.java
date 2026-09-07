package io.openaev.rest.inject;

import static io.openaev.config.TenantUriUtils.TENANT_PREFIX;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.openaev.IntegrationTest;
import io.openaev.database.model.Capability;
import io.openaev.utils.JsonTestUtils;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.mockUser.WithMockUser;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestPropertySource(properties = "openaev.tenant.active-tables=injects")
@WithMockUser(withCapabilities = {Capability.ACCESS_ASSESSMENT})
@DisplayName("injects isolation holds for non-admin")
class InjectNonAdminIsolationTest extends IntegrationTest {

  private static final String OPTIONS_URI = TENANT_PREFIX + "/injects/options";
  private static final Set<Capability> READ_INJECTS = Set.of(Capability.ACCESS_ASSESSMENT);

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;

  private String tenantA;
  private String injectA;
  private String injectB;

  @BeforeEach
  void seedTwoTenantsWithOneInjectEach() throws Exception {
    tenantA = tenantHelper.createTenantWithCapabilities("inject-nonadmin-a", READ_INJECTS).getId();
    String tenantB =
        tenantHelper.createTenantWithCapabilities("inject-nonadmin-b", READ_INJECTS).getId();
    injectA = seedInject(tenantA, "nonadmin-inject-a");
    injectB = seedInject(tenantB, "nonadmin-inject-b");
  }

  @Nested
  @DisplayName("tenant-scoped options")
  class TenantScopedOptions {

    @Test
    void given_tenantA_scope_should_return_only_tenantA_inject_option() throws Exception {
      // Arrange
      String requestBody = JsonTestUtils.asJsonString(List.of(injectA, injectB));

      // Act
      String response =
          mvc.perform(
                  post(OPTIONS_URI, tenantA)
                      .contentType(MediaType.APPLICATION_JSON)
                      .content(requestBody.getBytes(StandardCharsets.UTF_8))
                      .with(csrf()))
              .andExpect(status().isOk())
              .andReturn()
              .getResponse()
              .getContentAsString();

      // Assert
      assertTrue(response.contains(injectA), "tenant A inject id must be present");
      assertFalse(response.contains(injectB), "tenant B inject id must not leak");
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
