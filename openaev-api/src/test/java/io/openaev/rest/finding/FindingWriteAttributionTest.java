package io.openaev.rest.finding;

import static org.junit.jupiter.api.Assertions.assertEquals;

import io.openaev.IntegrationTest;
import io.openaev.context.TenantContext;
import io.openaev.database.model.Finding;
import io.openaev.database.model.Inject;
import io.openaev.database.model.Tenant;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.mockUser.WithMockUser;
import jakarta.persistence.EntityManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.UUID;
import org.hibernate.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

/**
 * A finding belongs to the tenant of the inject that produced it, and to nothing else. That is what
 * {@code FindingService.createFindings} states explicitly with {@code
 * finding.setTenant(inject.getTenant())}.
 *
 * <p>Its singular sibling {@code createFinding} did not, and relied on {@code TenantBaseListener}
 * to stamp whatever {@code TenantContext} happened to hold. The two are not the same tenant: the
 * thread-local is ambient and defaults to {@code Tenant.DEFAULT_TENANT_UUID} off the request path,
 * so a create could attribute a finding to a tenant that does not own its inject. This test sets
 * the ambient tenant to a DIFFERENT one on purpose, which is the only arrangement that tells the
 * two apart.
 */
@Transactional
@WithMockUser(isAdmin = true)
@DisplayName("a finding is attributed to its inject's tenant, never to the ambient one")
class FindingWriteAttributionTest extends IntegrationTest {

  @Autowired private FindingService findingService;
  @Autowired private TenantIsolationTestHelper tenantHelper;
  @Autowired private EntityManager entityManager;

  private String injectTenant;
  private String ambientTenant;
  private String injectId;

  @BeforeEach
  void seedAnInjectInOneTenantAndPointTheAmbientAtAnother() throws Exception {
    injectTenant =
        tenantHelper.createTenantWithCurrentUser("fw-inject-" + UUID.randomUUID()).getId();
    ambientTenant =
        tenantHelper.createTenantWithCurrentUser("fw-ambient-" + UUID.randomUUID()).getId();
    injectId = seedInject(injectTenant);
    // The ambient tenant is deliberately NOT the inject's: that is what distinguishes attribution
    // from the inject from attribution by the listener.
    TenantContext.setCurrentTenant(ambientTenant);
  }

  @Test
  @DisplayName("createFinding takes the tenant from the inject, not from TenantContext")
  void createFindingIsAttributedToTheInjectTenant() {
    Finding finding = new Finding();
    finding.setValue("attribution-" + UUID.randomUUID());
    finding.setType(io.openaev.database.model.ContractOutputType.Text);
    finding.setField("hostname");
    finding.setName("attribution probe");

    Finding created = findingService.createFinding(finding, injectId);
    entityManager.flush();

    assertEquals(
        injectTenant,
        rawTenantOf(created.getId()),
        "the finding must belong to the tenant that owns its inject; the ambient TenantContext points"
            + " at another tenant on purpose, so a match on that one means the listener attributed"
            + " it rather than the create path");
  }

  /** Ground truth by raw JDBC: a scoped read could not see a row in the wrong tenant. */
  private String rawTenantOf(String findingId) {
    return entityManager
        .unwrap(Session.class)
        .doReturningWork(
            connection -> {
              try (PreparedStatement st =
                  connection.prepareStatement(
                      "SELECT tenant_id FROM findings WHERE finding_id = ?")) {
                st.setString(1, findingId);
                try (ResultSet rs = st.executeQuery()) {
                  return rs.next() ? rs.getString(1) : null;
                }
              }
            });
  }

  private String seedInject(String tenantId) {
    // The fixture, not a hand-built entity: Inject carries required fields (dependsDuration among
    // them) that a bare constructor leaves null.
    Inject inject = io.openaev.utils.fixtures.InjectFixture.getDefaultInject();
    inject.setTenant(new Tenant(tenantId));
    entityManager.persist(inject);
    entityManager.flush();
    return inject.getId();
  }
}
