package io.openaev.database.audit;

import java.util.Set;

/**
 * The search engine indexed new or changed documents (or removed some from the index), so that
 * analytics read from it (widget data) may have changed. It is published by the indexing loop and
 * the index deletes, outside the JPA listener chain and possibly outside any transaction, and names
 * no document: only the tenants whose analytics may have changed.
 *
 * @param tenantIds the tenants of the documents written, or {@code null} when they are unknown or
 *     when a document without a tenant (shown in every tenant) was written
 */
public record AnalyticsIndexedEvent(Set<String> tenantIds) {

  public AnalyticsIndexedEvent {
    tenantIds = tenantIds == null ? null : Set.copyOf(tenantIds);
  }

  /** An event for documents whose tenants are unknown, or shown in every tenant. */
  public static AnalyticsIndexedEvent everyTenant() {
    return new AnalyticsIndexedEvent(null);
  }

  /** Whether the event reaches every tenant rather than the listed ones. */
  public boolean isEveryTenant() {
    return tenantIds == null;
  }
}
