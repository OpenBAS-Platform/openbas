package io.openaev.rest.asset;

import static io.openaev.utils.JsonTestUtils.asJsonString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openaev.IntegrationTest;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import io.openaev.database.model.Endpoint;
import io.openaev.service.EndpointService;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.fixtures.PaginationFixture;
import io.openaev.utils.mockUser.WithMockUser;
import jakarta.persistence.EntityManager;
import java.util.UUID;
import org.hibernate.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * A paginated search issues two queries: the data page and a separate count. Spring Data builds the
 * count itself, and the two do not necessarily present the same shape to {@code
 * TenantStatementInspector}.
 *
 * <p>That matters because {@code totalElements} is what the UI shows and what {@code
 * EndpointApiTest}'s cross-tenant assertion reads. A filtered page with an unfiltered count is
 * worse than an outright leak: the list looks correctly empty while the number next to it says
 * another tenant has rows.
 *
 * <p>Both halves are asserted separately here, on purpose. Asserting only the page would pass
 * through exactly this defect.
 */
@Transactional
@TestPropertySource(properties = "openaev.tenant.active-tables=assets")
@WithMockUser(isAdmin = true)
@DisplayName("a paginated endpoint search filters its count, not just its page")
class EndpointSearchCountScopeTest extends IntegrationTest {

  @Autowired private MockMvc mvc;
  @Autowired private EndpointService endpointService;
  @Autowired private TenantIsolationTestHelper tenantHelper;
  @Autowired private TenantScopedTransaction tenantTx;
  @Autowired private EntityManager entityManager;

  private String tenantA;
  private String tenantB;
  private static final String NAME = "count-scope-endpoint";

  @BeforeEach
  void seedOneEndpointInTenantA() throws Exception {
    tenantA = tenantHelper.createTenantWithCurrentUser("count-a-" + UUID.randomUUID()).getId();
    tenantB = tenantHelper.createTenantWithCurrentUser("count-b-" + UUID.randomUUID()).getId();
    String id = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO assets (asset_id, asset_name, asset_type, asset_created_at,"
                + " asset_updated_at, tenant_id, asset_hostname, endpoint_platform, endpoint_arch)"
                + " VALUES (:id, :name, 'Endpoint', now(), now(), :tenantId, :name, 'Linux',"
                + " 'x86_64')")
        .setParameter("id", id)
        .setParameter("name", NAME)
        .setParameter("tenantId", tenantA)
        .executeUpdate();
    entityManager.flush();
    entityManager.clear();
  }

  @Test
  @DisplayName("under tenant A: the endpoint is found, and counted once")
  void ownTenantSeesItInBothHalves() {
    Page<Endpoint> page = searchUnder(tenantA);
    assertEquals(1, page.getContent().size(), "A's endpoint must be on the page");
    assertEquals(1, page.getTotalElements(), "and counted once");
  }

  @Test
  @DisplayName("under tenant B: neither the page nor the count sees A's endpoint")
  void otherTenantSeesItInNeitherHalf() {
    Page<Endpoint> page = searchUnder(tenantB);
    assertEquals(0, page.getContent().size(), "A's endpoint must not be on B's page");
    assertEquals(
        0,
        page.getTotalElements(),
        "and must not be counted either: a filtered page with an unfiltered count shows an empty"
            + " list next to a non-zero total, which is how a cross-tenant leak hides");
  }

  @Test
  @DisplayName("through HTTP under tenant B: totalElements must be zero too")
  void httpSearchUnderOtherTenantCountsZero() throws Exception {
    // The combination neither existing test covered: the HTTP route AND the count.
    // AssetHttpIsolationTest
    // goes through HTTP but asserts on the body, and the two cases above assert the count but set
    // the
    // scope directly. EndpointApiTest fails exactly here.
    String body =
        mvc.perform(
                post("/api/tenants/{tenantId}/endpoints/search", tenantB)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(PaginationFixture.simpleTextSearch(NAME)))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertEquals(
        0,
        ((Number) JsonPath.read(body, "$.totalElements")).intValue(),
        "an endpoint owned by another tenant must not be counted: " + body);
  }

  private Page<Endpoint> searchUnder(String tenantId) {
    tenantTx.setScopeOnCurrentTransaction(TxCtx.forTenant(tenantId));
    entityManager.unwrap(Session.class).disableFilter("tenantFilter");
    return endpointService.searchEndpoints(PaginationFixture.simpleTextSearch(NAME));
  }
}
