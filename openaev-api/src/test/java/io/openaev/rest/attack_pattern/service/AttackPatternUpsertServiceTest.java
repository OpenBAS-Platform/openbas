package io.openaev.rest.attack_pattern.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.openaev.IntegrationTest;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import io.openaev.database.model.AttackPattern;
import io.openaev.database.repository.AttackPatternRepository;
import io.openaev.rest.attack_pattern.form.AttackPatternCreateInput;
import io.openaev.utils.TenantIsolationTestHelper;
import io.openaev.utils.mockUser.WithMockUser;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.server.ResponseStatusException;

// Not @Transactional: the lock must be held by a transaction other than the one under test.
@TestPropertySource(properties = "openaev.tenant.active-tables=attack_patterns")
@WithMockUser(isAdmin = true)
@DisplayName("Attack pattern upsert")
class AttackPatternUpsertServiceTest extends IntegrationTest {

  @Autowired private AttackPatternUpsertService upsertService;
  @Autowired private AttackPatternRepository attackPatternRepository;
  @Autowired private TenantScopedTransaction tenantTx;
  @Autowired private TenantIsolationTestHelper tenantHelper;
  @Autowired private DataSource dataSource;

  private String tenantA;
  private String tenantB;

  @BeforeEach
  void createTwoTenants() throws Exception {
    tenantA = tenantHelper.createTenantWithCurrentUser("ap-upsert-a").getId();
    tenantB = tenantHelper.createTenantWithCurrentUser("ap-upsert-b").getId();
  }

  @AfterEach
  void cleanUp() {
    JdbcTemplate jdbc = new JdbcTemplate(dataSource);
    jdbc.update(
        "DELETE FROM attack_patterns WHERE tenant_id IN (?, ?) AND attack_pattern_parent IS NOT NULL",
        tenantA,
        tenantB);
    jdbc.update("DELETE FROM attack_patterns WHERE tenant_id IN (?, ?)", tenantA, tenantB);
    tenantHelper.deleteCommittedTenants(tenantA, tenantB);
  }

  @Nested
  @DisplayName("Concurrency")
  class Concurrency {

    @Test
    @DisplayName("given an upsert running in a tenant, should reject a second one with a 409")
    void given_upsertRunning_should_rejectSecondUpsertInSameTenant() throws Exception {
      // Arrange / Act / Assert
      holdUpsertLock(
          tenantA,
          () ->
              assertThatThrownBy(() -> upsert(tenantA, List.of()))
                  .isInstanceOfSatisfying(
                      ResponseStatusException.class,
                      e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT)));
    }

    @Test
    @DisplayName("given an upsert running in a tenant, should let another tenant upsert")
    void given_upsertRunning_should_letOtherTenantProceed() throws Exception {
      // Arrange / Act / Assert
      holdUpsertLock(
          tenantA,
          () ->
              assertThatCode(() -> upsert(tenantB, List.of(input("T9901", null))))
                  .doesNotThrowAnyException());
    }
  }

  @Nested
  @DisplayName("Parent")
  class Parent {

    @Test
    @DisplayName("given a new child and its parent in one upsert, should link the child")
    void given_newChildAndParent_should_linkChildToParent() {
      // Arrange
      AttackPatternCreateInput parent = input("T9902", null);
      AttackPatternCreateInput child = input("T9902.001", parent.getStixId());

      // Act
      upsert(tenantA, List.of(child, parent));

      // Assert
      assertThat(storedParentExternalId("T9902.001")).isEqualTo("T9902");
    }
  }

  private List<AttackPattern> upsert(String tenantId, List<AttackPatternCreateInput> inputs) {
    TxCtx ctx = TxCtx.forTenant(tenantId);
    return tenantTx.execute(ctx, () -> upsertService.upsert(ctx, inputs, false));
  }

  private void holdUpsertLock(String tenantId, Runnable whileHeld) throws Exception {
    CountDownLatch locked = new CountDownLatch(1);
    CountDownLatch release = new CountDownLatch(1);
    ExecutorService pool = Executors.newSingleThreadExecutor();
    try {
      TxCtx ctx = TxCtx.forTenant(tenantId);
      Future<?> holder =
          pool.submit(
              () ->
                  tenantTx.execute(
                      ctx,
                      () -> {
                        assertThat(attackPatternRepository.tryLockUpsert(tenantId)).isTrue();
                        locked.countDown();
                        await(release);
                      }));
      assertThat(locked.await(10, TimeUnit.SECONDS)).isTrue();
      try {
        whileHeld.run();
      } finally {
        release.countDown();
        holder.get(10, TimeUnit.SECONDS);
      }
    } finally {
      pool.shutdownNow();
    }
  }

  private static void await(CountDownLatch latch) {
    try {
      latch.await(10, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  private static AttackPatternCreateInput input(String externalId, String parentStixId) {
    AttackPatternCreateInput input = new AttackPatternCreateInput();
    input.setName("upsert-" + externalId);
    input.setExternalId(externalId);
    input.setParentId(parentStixId);
    return input;
  }

  private String storedParentExternalId(String externalId) {
    return new JdbcTemplate(dataSource)
        .queryForObject(
            "SELECT p.attack_pattern_external_id FROM attack_patterns c"
                + " JOIN attack_patterns p ON p.attack_pattern_id = c.attack_pattern_parent"
                + " WHERE c.attack_pattern_external_id = ? AND c.tenant_id = ?",
            String.class,
            externalId,
            tenantA);
  }
}
