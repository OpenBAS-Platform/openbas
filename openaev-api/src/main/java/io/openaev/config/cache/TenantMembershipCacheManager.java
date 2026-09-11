package io.openaev.config.cache;

import io.openaev.annotation.AllowRawJdbc;
import io.openaev.database.repository.TenantRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Caches tenant membership checks to avoid hitting the database on every HTTP request. The cache
 * has a short TTL (5 minutes) and is explicitly evicted when users are added to or removed from
 * tenants.
 *
 * <p>{@link #findTenantIdsByUserId(String)} is a JDBC id-only lookup so argument resolution (and
 * other request-scoped callers) do not open a Hibernate session. Combined with open-in-view, a
 * Hibernate query here would hold a pool connection for the whole HTTP request and trip Hikari leak
 * detection on long POSTs.
 */
@Service
@RequiredArgsConstructor
@AllowRawJdbc(
    reason =
        "reads users_tenants.tenant_id joined to tenants.tenant_deleted_at for an explicit user_id"
            + " bind so TxCtx argument resolution can return ids without a Hibernate session; OSIV"
            + " would otherwise hold the pool connection for the whole HTTP request. Same"
            + " soft-delete predicate as TenantRepository.findTenantsByUserId; no tenant row"
            + " payloads are returned.")
public class TenantMembershipCacheManager {

  static final String TENANT_MEMBERSHIP_CACHE = "tenantMembership";
  static final String USER_TENANT_IDS_CACHE = "userTenantIds";

  /** Must stay aligned with {@code TenantRepository.findTenantsByUserId} (active tenants only). */
  static final String USER_TENANT_IDS_SQL =
      "select ut.tenant_id from users_tenants ut"
          + " join tenants t on t.tenant_id = ut.tenant_id"
          + " where ut.user_id = ?"
          + " and t.tenant_deleted_at is null"
          + " order by t.tenant_name";

  private final TenantRepository tenantRepository;
  private final JdbcTemplate jdbcTemplate;
  private final CacheManager cacheManager;

  /**
   * Returns whether the given user belongs to the given tenant (cached). The cache is explicitly
   * evicted when users are added to or removed from tenants, so membership changes take effect
   * immediately.
   */
  @Cacheable(value = TENANT_MEMBERSHIP_CACHE, key = "#userId + ':' + #tenantId")
  public boolean existsByUserIdAndTenantId(String userId, String tenantId) {
    return tenantRepository.existsByUserIdAndTenantId(userId, tenantId);
  }

  /**
   * Returns the tenant ids the user belongs to (cached). Uses JDBC so the connection is borrowed
   * and returned immediately, independent of Hibernate open-in-view.
   */
  @Cacheable(value = USER_TENANT_IDS_CACHE, key = "#userId")
  public List<String> findTenantIdsByUserId(String userId) {
    return List.copyOf(jdbcTemplate.queryForList(USER_TENANT_IDS_SQL, String.class, userId));
  }

  /**
   * Evicts a specific user-tenant membership entry and the user's cached tenant-id list after
   * membership changes.
   *
   * <p>Evicted immediately (so a subsequent read in the same transaction — or from an entirely
   * non-transactional caller — never sees the stale entry), and evicted again after the enclosing
   * transaction commits, if any: a membership row that is inserted or removed is not visible to
   * other connections until commit (READ COMMITTED), so a concurrent request could still repopulate
   * the cache from the pre-commit state during the window before commit. The post-commit eviction
   * busts that possibly-stale repopulation, forcing the next read to go back to the database once
   * the row is actually visible everywhere. Every caller that mutates {@code users_tenants} must go
   * through this method (or {@link #evictForUser}) instead of evicting the caches directly, so both
   * guarantees apply uniformly regardless of which service triggered the membership change.
   */
  public void evict(String userId, String tenantId) {
    evictNow(userId, tenantId);
    evictAgainAfterCommit(() -> evictNow(userId, tenantId));
  }

  /**
   * Evicts all cached tenant membership entries for a given user, including the cached tenant-id
   * list. Same immediate-plus-after-commit double eviction as {@link #evict(String, String)}.
   */
  public void evictForUser(String userId, List<String> tenantIds) {
    evictForUserNow(userId, tenantIds);
    evictAgainAfterCommit(() -> evictForUserNow(userId, tenantIds));
  }

  /**
   * Registers {@code eviction} to run again after the enclosing transaction commits. No-op if no
   * transaction is active — the immediate eviction the caller already performed is the only one
   * needed in that case.
   */
  private void evictAgainAfterCommit(Runnable eviction) {
    if (!TransactionSynchronizationManager.isSynchronizationActive()) {
      return;
    }
    TransactionSynchronizationManager.registerSynchronization(
        new TransactionSynchronization() {
          @Override
          public void afterCommit() {
            eviction.run();
          }
        });
  }

  private void evictNow(String userId, String tenantId) {
    Cache membershipCache = cacheManager.getCache(TENANT_MEMBERSHIP_CACHE);
    if (membershipCache != null) {
      membershipCache.evict(userId + ":" + tenantId);
    }
    Cache tenantIdsCache = cacheManager.getCache(USER_TENANT_IDS_CACHE);
    if (tenantIdsCache != null) {
      tenantIdsCache.evict(userId);
    }
  }

  private void evictForUserNow(String userId, List<String> tenantIds) {
    Cache tenantIdsCache = cacheManager.getCache(USER_TENANT_IDS_CACHE);
    if (tenantIdsCache != null) {
      tenantIdsCache.evict(userId);
    }
    Cache membershipCache = cacheManager.getCache(TENANT_MEMBERSHIP_CACHE);
    if (membershipCache != null) {
      for (String tenantId : tenantIds) {
        membershipCache.evict(userId + ":" + tenantId);
      }
    }
  }
}
