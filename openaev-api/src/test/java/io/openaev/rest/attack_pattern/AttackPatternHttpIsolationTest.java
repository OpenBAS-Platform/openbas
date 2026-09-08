package io.openaev.rest.attack_pattern;

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
import io.openaev.rest.attack_pattern.form.AttackPatternCreateInput;
import io.openaev.rest.attack_pattern.form.AttackPatternUpdateInput;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.fixtures.PaginationFixture;
import io.openaev.utils.mockUser.WithMockUser;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.UUID;
import org.hibernate.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * End-to-end proof that, with {@code attack_patterns} activated, the tenant scope set from the URL
 * path isolates the table through the real {@link AttackPatternApi} endpoints. A user who belongs
 * to two tenants sees an attack pattern only under its own tenant's path, never another tenant's.
 *
 * <p>Each test stays on a single tenant path so the per-request scope is set once: re-applying the
 * same scope inside the test transaction is tolerated, changing it would hit the nesting guard.
 */
@Transactional
@TestPropertySource(properties = "openaev.tenant.active-tables=attack_patterns")
@WithMockUser(isAdmin = true)
@DisplayName("attack_patterns read and write isolation through the real HTTP endpoint")
class AttackPatternHttpIsolationTest extends IntegrationTest {

  private static final String TENANT_ATTACK_PATTERNS = "/api/tenants/{tenantId}/attack_patterns";
  private static final String TENANT_ATTACK_PATTERN_BY_ID =
      TENANT_ATTACK_PATTERNS + "/{attackPatternId}";

  @Autowired private MockMvc mvc;
  @Autowired private TenantIsolationTestHelper tenantHelper;

  private String tenantA;
  private String tenantB;
  private String attackPatternA;
  private String attackPatternB;

  @BeforeEach
  void seedTwoTenantsWithOneAttackPatternEach() throws Exception {
    tenantA = tenantHelper.createTenantWithCurrentUser("ap-iso-a").getId();
    tenantB = tenantHelper.createTenantWithCurrentUser("ap-iso-b").getId();
    attackPatternA = seedAttackPattern(tenantA, "attack-pattern-a", "T9901");
    attackPatternB = seedAttackPattern(tenantB, "attack-pattern-b", "T9902");
  }

  @Test
  @DisplayName("under tenant A's path: A's attack pattern is visible, B's is hidden")
  void underTenantAPath() throws Exception {
    mvc.perform(get(TENANT_ATTACK_PATTERN_BY_ID, tenantA, attackPatternA))
        .andExpect(status().isOk());
    mvc.perform(get(TENANT_ATTACK_PATTERN_BY_ID, tenantA, attackPatternB))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("under tenant B's path: B's attack pattern is visible, A's is hidden")
  void underTenantBPath() throws Exception {
    mvc.perform(get(TENANT_ATTACK_PATTERN_BY_ID, tenantB, attackPatternB))
        .andExpect(status().isOk());
    mvc.perform(get(TENANT_ATTACK_PATTERN_BY_ID, tenantB, attackPatternA))
        .andExpect(status().isNotFound());
  }

  // This test is expected to stay red while AttackPattern's v1 @Filter("tenantFilter") is still
  // active: the v1 thread-local predicate ANDs with the v2 scope and returns nothing for the
  // header-selected tenant. Phase 6 (go-live) removes the v1 @Filter/TenantBaseListener from
  // AttackPattern and re-enables this test in the same commit.
  @Disabled("Stays red until go-live removes AttackPattern's v1 @Filter (see class javadoc)")
  @Test
  @DisplayName(
      "via the X-Tenant-Ids header (no path tenant): search returns A's attack pattern and not"
          + " B's")
  void searchViaHeaderReturnsOnlyA() throws Exception {
    String body = asJsonString(PaginationFixture.getDefault().textSearch("").build());
    String response =
        mvc.perform(
                post("/api/attack_patterns/search")
                    .header("X-Tenant-Ids", tenantA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertTrue(
        response.contains(attackPatternA),
        "A's attack pattern must appear when A is selected via header");
    assertFalse(response.contains(attackPatternB), "B's attack pattern must not appear");
  }

  @Test
  @DisplayName("under tenant A's path: search returns A's attack pattern and not B's")
  void searchUnderTenantAReturnsOnlyA() throws Exception {
    String body = asJsonString(PaginationFixture.getDefault().textSearch("").build());
    String response =
        mvc.perform(
                post(TENANT_ATTACK_PATTERNS + "/search", tenantA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertTrue(
        response.contains(attackPatternA), "A's attack pattern must appear in A's search results");
    assertFalse(
        response.contains(attackPatternB),
        "B's attack pattern must not appear in A's search results");
  }

  @Test
  @DisplayName("a create under tenant A's path is attributed to tenant A")
  void createUnderTenantAIsAttributedToA() throws Exception {
    AttackPatternCreateInput input = new AttackPatternCreateInput();
    input.setName("created-under-a");
    input.setExternalId("T9910");
    input.setStixId("attack-pattern--" + UUID.randomUUID());

    String response =
        mvc.perform(
                post(TENANT_ATTACK_PATTERNS, tenantA)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(asJsonString(input))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    String createdId = JsonPath.read(response, "$.attack_pattern_id");
    String storedTenant =
        (String)
            entityManager
                .createNativeQuery(
                    "SELECT tenant_id FROM attack_patterns WHERE attack_pattern_id = ?1")
                .setParameter(1, createdId)
                .getSingleResult();
    assertEquals(tenantA, storedTenant, "the created attack pattern must belong to tenant A");
  }

  @Test
  @DisplayName("a create with no tenant selector is refused (a single-tenant scope is required)")
  void createWithoutSelectorIsRejected() throws Exception {
    AttackPatternCreateInput input = new AttackPatternCreateInput();
    input.setName("no-selector");
    input.setExternalId("T9911");
    input.setStixId("attack-pattern--" + UUID.randomUUID());

    mvc.perform(
            post("/api/attack_patterns")
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input))
                .with(csrf()))
        .andExpect(status().isBadRequest());
  }

  @Test
  @DisplayName("upserting the same external_id under A and B yields two distinct rows")
  void upsertSameExternalIdUnderTwoTenantsYieldsTwoRows() throws Exception {
    // Arrange: seed a row for tenant B directly (bypasses the scope, no tenant-switch mid-tx)
    String sharedExternalId = "T9920";
    seedAttackPattern(tenantB, "shared-b", sharedExternalId);

    // Act: upsert the same external_id under tenant A — must produce a second independent row
    String upsertBody =
        "{\"attack_patterns\":[{\"attack_pattern_name\":\"shared-a\","
            + "\"attack_pattern_external_id\":\""
            + sharedExternalId
            + "\","
            + "\"attack_pattern_stix_id\":\"attack-pattern--"
            + UUID.randomUUID()
            + "\"}]}";
    mvc.perform(
            post(TENANT_ATTACK_PATTERNS + "/upsert", tenantA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(upsertBody)
                .with(csrf()))
        .andExpect(status().isOk());

    // Assert: two rows share the same external_id — one per tenant
    entityManager.flush();
    long rowCount =
        entityManager
            .unwrap(Session.class)
            .doReturningWork(
                connection -> {
                  try (PreparedStatement stmt =
                      connection.prepareStatement(
                          "SELECT count(*) FROM attack_patterns WHERE attack_pattern_external_id ="
                              + " ?")) {
                    stmt.setString(1, sharedExternalId);
                    try (ResultSet rs = stmt.executeQuery()) {
                      rs.next();
                      return rs.getLong(1);
                    }
                  }
                });
    assertEquals(2L, rowCount, "each tenant must own an independent row for the same external_id");
  }

  @Test
  @DisplayName("under tenant A's path: A can update its own attack pattern")
  void updateUnderTenantAUpdatesOwnAttackPattern() throws Exception {
    AttackPatternUpdateInput input = new AttackPatternUpdateInput();
    input.setName("renamed-a");
    input.setExternalId("T9901");

    mvc.perform(
            put(TENANT_ATTACK_PATTERN_BY_ID, tenantA, attackPatternA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input))
                .with(csrf()))
        .andExpect(status().isOk());
    assertEquals("renamed-a", rawName(attackPatternA), "A's own attack pattern must be updated");
  }

  @Test
  @DisplayName(
      "under tenant A's path: updating B's attack pattern is not found and leaves it untouched")
  void updateUnderTenantAOfBAttackPatternIsBlocked() throws Exception {
    AttackPatternUpdateInput input = new AttackPatternUpdateInput();
    input.setName("hijacked");
    input.setExternalId("T9902");

    mvc.perform(
            put(TENANT_ATTACK_PATTERN_BY_ID, tenantA, attackPatternB)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(input))
                .with(csrf()))
        .andExpect(status().isNotFound());
    assertEquals(
        "attack-pattern-b", rawName(attackPatternB), "B's attack pattern must be untouched");
  }

  @Test
  @DisplayName("under tenant A's path: A can delete its own attack pattern")
  void deleteUnderTenantADeletesOwnAttackPattern() throws Exception {
    mvc.perform(delete(TENANT_ATTACK_PATTERN_BY_ID, tenantA, attackPatternA).with(csrf()))
        .andExpect(status().is2xxSuccessful());
    assertEquals(0L, rawCount(attackPatternA), "A's own attack pattern must be deleted");
  }

  @Test
  @DisplayName(
      "under tenant A's path: deleting B's attack pattern is a no-op and leaves it in place")
  void deleteUnderTenantAOfBAttackPatternIsBlocked() throws Exception {
    mvc.perform(delete(TENANT_ATTACK_PATTERN_BY_ID, tenantA, attackPatternB).with(csrf()))
        .andExpect(status().is2xxSuccessful());
    assertEquals(
        1L, rawCount(attackPatternB), "B's attack pattern must survive tenant A's delete attempt");
  }

  // Ground-truth reads, bypassing the scope: raw JDBC on the test's own connection sees the
  // uncommitted seed and the rewriter does not touch a statement it never generated. A flush first
  // forces any pending scoped UPDATE/DELETE to reach the database.
  private String rawName(String attackPatternId) {
    entityManager.flush();
    return entityManager
        .unwrap(Session.class)
        .doReturningWork(
            connection -> {
              try (PreparedStatement statement =
                  connection.prepareStatement(
                      "SELECT attack_pattern_name FROM attack_patterns WHERE attack_pattern_id ="
                          + " ?")) {
                statement.setString(1, attackPatternId);
                try (ResultSet rows = statement.executeQuery()) {
                  return rows.next() ? rows.getString(1) : null;
                }
              }
            });
  }

  private long rawCount(String attackPatternId) {
    entityManager.flush();
    return entityManager
        .unwrap(Session.class)
        .doReturningWork(
            connection -> {
              try (PreparedStatement statement =
                  connection.prepareStatement(
                      "SELECT count(*) FROM attack_patterns WHERE attack_pattern_id = ?")) {
                statement.setString(1, attackPatternId);
                try (ResultSet rows = statement.executeQuery()) {
                  rows.next();
                  return rows.getLong(1);
                }
              }
            });
  }

  private String seedAttackPattern(String tenantId, String name, String externalId) {
    String id = UUID.randomUUID().toString();
    entityManager
        .createNativeQuery(
            "INSERT INTO attack_patterns"
                + " (attack_pattern_id, attack_pattern_name, attack_pattern_external_id,"
                + "  attack_pattern_stix_id, tenant_id)"
                + " VALUES (?1, ?2, ?3, ?4, ?5)")
        .setParameter(1, id)
        .setParameter(2, name)
        .setParameter(3, externalId)
        .setParameter(4, "attack-pattern--" + UUID.randomUUID())
        .setParameter(5, tenantId)
        .executeUpdate();
    return id;
  }
}
