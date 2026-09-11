package io.openaev.service.tenants;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.openaev.config.cache.TenantMembershipCacheManager;
import io.openaev.context.TenantContext;
import io.openaev.database.model.User;
import io.openaev.database.repository.TenantRepository;
import io.openaev.database.repository.UserRepository;
import io.openaev.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Unit test for the membership-cache eviction ordering in {@link TenantUserService}. Deliberately a
 * plain Mockito unit test rather than an {@code IntegrationTest}: the bug this guards against is a
 * cross-connection race (a concurrent request repopulating the cache from pre-commit data), and a
 * single JDBC connection/transaction always sees its own uncommitted writes, so an integration test
 * asserting on the same connection cannot distinguish "evicted immediately" from "evicted after
 * commit" — the {@link TransactionSynchronizationManager} plumbing itself is the thing under test
 * here, independent of any real database interaction.
 */
@ExtendWith(MockitoExtension.class)
class TenantUserServiceCacheEvictionTest {

  @Mock private UserService userService;
  @Mock private UserRepository userRepository;
  @Mock private TenantRepository tenantRepository;
  @Mock private TenantMembershipCacheManager tenantMembershipCacheManager;

  private TenantUserService tenantUserService;

  @AfterEach
  void tearDown() {
    // Never leave synchronization active for the next test in the same thread.
    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.clearSynchronization();
    }
  }

  private TenantUserService newService() {
    return new TenantUserService(
        userService, userRepository, tenantRepository, tenantMembershipCacheManager);
  }

  @Test
  @DisplayName("given_activeTransaction_attachToTenant_should_deferCacheEvictionUntilAfterCommit")
  void given_activeTransaction_attachToTenant_should_deferCacheEvictionUntilAfterCommit() {
    // -- ARRANGE --
    tenantUserService = newService();
    TransactionSynchronizationManager.initSynchronization();

    // -- ACT --
    tenantUserService.attachToTenant("user-1", "tenant-1");

    // -- ASSERT --
    // The row write happens immediately, but the cache must NOT be evicted yet: evicting here,
    // before commit, is exactly the bug — it lets a concurrent reader repopulate the cache from
    // data that predates the commit.
    verify(tenantRepository).addUserToTenant("user-1", "tenant-1");
    verify(tenantMembershipCacheManager, never()).evict("user-1", "tenant-1");

    // Simulate the transaction committing: only then must the eviction fire.
    TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCommit());

    verify(tenantMembershipCacheManager).evict("user-1", "tenant-1");
  }

  @Test
  @DisplayName("given_activeTransaction_detach_should_deferCacheEvictionUntilAfterCommit")
  void given_activeTransaction_detach_should_deferCacheEvictionUntilAfterCommit() {
    // -- ARRANGE --
    tenantUserService = newService();
    TenantContext.setCurrentTenant("tenant-1");
    User user = new User();
    user.setId("user-1");
    user.setEmail("user-1@test.invalid");
    when(userService.user(anyString())).thenReturn(user);
    TransactionSynchronizationManager.initSynchronization();

    try {
      // -- ACT --
      tenantUserService.detach("user-1");

      // -- ASSERT --
      // detach() removes a membership row; evicting early would let a concurrent reader cache
      // "still a member" from pre-removal data, so the eviction must also be deferred.
      verify(tenantRepository).removeUserFromTenant("user-1", "tenant-1");
      verify(tenantMembershipCacheManager, never()).evict("user-1", "tenant-1");

      TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCommit());

      verify(tenantMembershipCacheManager).evict("user-1", "tenant-1");
    } finally {
      TenantContext.clearCurrentTenant();
    }
  }

  @Test
  @DisplayName("given_noActiveTransaction_attachToTenant_should_evictImmediately")
  void given_noActiveTransaction_attachToTenant_should_evictImmediately() {
    // -- ARRANGE --
    tenantUserService = newService();
    // No TransactionSynchronizationManager.initSynchronization(): nothing to defer to.

    // -- ACT --
    tenantUserService.attachToTenant("user-2", "tenant-2");

    // -- ASSERT --
    verify(tenantMembershipCacheManager).evict("user-2", "tenant-2");
  }
}
