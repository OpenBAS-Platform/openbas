package io.openaev.stream;

import io.openaev.context.TenantContext;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import java.util.function.Supplier;

/**
 * Runs stream checks under a tenant's scope. They run on WebSocket and scheduler threads, outside
 * any HTTP request, so both scopes are set here: the v1 {@link TenantContext} (also read by {@code
 * User.getCapabilities()}) and the v2 transaction scope.
 */
final class StreamTenantScope {

  private StreamTenantScope() {}

  static <T> T execute(TenantScopedTransaction tenantTx, String tenantId, Supplier<T> work) {
    TenantContext.setCurrentTenant(tenantId);
    try {
      return tenantTx.execute(TxCtx.forTenant(tenantId), work);
    } finally {
      TenantContext.clearCurrentTenant();
    }
  }
}
