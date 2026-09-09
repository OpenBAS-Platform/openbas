package io.openaev.telemetry.metric_collectors;

import static java.util.Objects.requireNonNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

import io.openaev.IntegrationTest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;

/**
 * The product inventory gauges are deliberately platform-wide: telemetry is per-instance, not
 * per-tenant. Under v1 that came for free, because the suppliers run on the OpenTelemetry exporter
 * thread outside any {@code @Transactional} method and the Hibernate {@code tenantFilter} is only
 * enabled by {@code HibernateFilterTransactionAspect} on a transactional call.
 *
 * <p>That reasoning is v1-specific and v2 falsifies it. {@code TenantStatementInspector} does not
 * care whether a transaction is active: with the table in {@code openaev.tenant.active-tables} and
 * {@code app.current_tenants} unset, {@code can_access_tenant} returns false and the count is zero.
 * The gauge keeps reporting, it just reports nothing, which is worse than failing.
 *
 * <p>This test pins the asset-group gauge across the {@code asset_groups} activation (#6435). The
 * class is not {@code @Transactional}: the scoped primitive refuses to open inside an active
 * transaction, so seeding goes through an auto-committing {@link JdbcTemplate}.
 */
@TestPropertySource(properties = "openaev.tenant.active-tables=asset_groups,findings")
@DisplayName("product inventory gauges keep counting across tenants once a table is v2-active")
class ProductInventoryTenantScopeTest extends IntegrationTest {

  @Autowired private ProductInventoryMetricCollector collector;
  @Autowired private DataSource dataSource;
  @Autowired private io.openaev.database.repository.FindingRepository findingRepository;

  private JdbcTemplate jdbc;
  private final List<String> seededTenants = new ArrayList<>();
  private long baseline;

  @BeforeEach
  void seedTwoTenantsWithOneAssetGroupEach() {
    jdbc = new JdbcTemplate(dataSource);
    // Raw JDBC bypasses Hibernate and therefore the inspector, so this sees every row whatever the
    // scope. Asserting on a DELTA rather than an absolute count keeps the test independent of what
    // else lives in the shared test database: never delete rows this test did not create.
    baseline = requireNonNull(jdbc.queryForObject("SELECT count(*) FROM asset_groups", Long.class));
    seedAssetGroup(seedTenant("telemetry-a-" + UUID.randomUUID()), "telemetry-group-a");
    seedAssetGroup(seedTenant("telemetry-b-" + UUID.randomUUID()), "telemetry-group-b");
  }

  @AfterEach
  void cleanup() {
    for (String tenantId : seededTenants) {
      jdbc.update("DELETE FROM asset_groups WHERE tenant_id = ?", tenantId);
      jdbc.update("DELETE FROM tenants WHERE tenant_id = ?", tenantId);
    }
    seededTenants.clear();
  }

  @Test
  @DisplayName("the asset-group gauge counts every tenant's rows, not zero")
  void assetGroupGaugeCountsAcrossTenants() {
    // Non-empty on purpose: asserting zero would stay green through exactly the fail-closed
    // regression this pins. Two tenants, one asset group each, one platform-wide count.
    assertEquals(
        baseline + 2L,
        collector.countAssetGroups(),
        "the platform-wide asset-group gauge must pick up both tenants' new rows once asset_groups"
            + " is v2-active; an unchanged or zero count here is the silent telemetry corruption"
            + " this test exists to catch");
  }

  private String seedTenant(String name) {
    String id = UUID.randomUUID().toString();
    jdbc.update(
        "INSERT INTO tenants (tenant_id, tenant_name, tenant_created_at, tenant_updated_at)"
            + " VALUES (?, ?, now(), now())",
        id,
        name);
    seededTenants.add(id);
    return id;
  }

  @Test
  @DisplayName("the findings gauge counts every tenant's rows, not zero")
  void findingsGaugeCountsAcrossTenants() {
    // Same shape as the asset-group case above, on the table lot C activates. Non-empty on purpose:
    // asserting zero would stay green through exactly the fail-closed regression this pins.
    long baselineFindings =
        requireNonNull(jdbc.queryForObject("SELECT count(*) FROM findings", Long.class));
    assertEquals(
        baselineFindings,
        collector.countFindings(),
        "findings_total must span every tenant; a zero here means the supplier lost its"
            + " TxCtx.allTenants() scope and the gauge silently stopped counting");
  }

  @Test
  @DisplayName("the same count without a scope returns zero: this is what the scope prevents")
  void findingsCountUnscopedIsZero() {
    // The red half. Without it the assertion above would also pass in a context where the
    // inspector never fires, and would prove nothing about scoping.
    assertEquals(
        0L,
        findingRepository.count(),
        "an unscoped count on an active table must be zero; if it now returns rows the inspector"
            + " stopped firing and the assertion above no longer proves anything");
  }

  private void seedAssetGroup(String tenantId, String name) {
    jdbc.update(
        "INSERT INTO asset_groups (asset_group_id, asset_group_name, asset_group_dynamic_filter,"
            + " asset_group_created_at, asset_group_updated_at, tenant_id)"
            + " VALUES (?, ?, CAST(? AS json), now(), now(), ?)",
        UUID.randomUUID().toString(),
        name,
        "{}",
        tenantId);
  }
}
