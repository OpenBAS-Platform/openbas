package io.openaev.stream;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Paces invalidations. Changes are recorded per tenant and topic and sent at the next drain, every
 * {@link #DRAIN_INTERVAL_MS} ms; a tenant and topic sent less than {@link #MIN_INTERVAL} ago waits
 * for the rest of that interval, so any burst (a bulk delete, an import) reaches each socket as at
 * most one {@code invalidate} per interval.
 *
 * <p>A change is recorded only while the tenant has a subscriber for the topic. A recorded change
 * is removed from the pending set before its message is sent, so a change recorded during a send is
 * sent again at a later drain rather than lost.
 */
public class StreamInvalidationBuffer {

  static final long DRAIN_INTERVAL_MS = 250;
  static final Duration MIN_INTERVAL = Duration.ofSeconds(2);

  private final StreamConnectionRegistry registry;
  private final StreamMetrics metrics;
  private final Clock clock;
  private final Set<StreamConnectionRegistry.TenantTopic> pending = ConcurrentHashMap.newKeySet();
  private final Map<StreamConnectionRegistry.TenantTopic, Instant> lastSent =
      new ConcurrentHashMap<>();

  public StreamInvalidationBuffer(
      StreamConnectionRegistry registry, StreamMetrics metrics, Clock clock) {
    this.registry = registry;
    this.metrics = metrics;
    this.clock = clock;
  }

  void record(String tenantId, StreamTopic topic) {
    if (registry.hasSubscribers(tenantId, topic)) {
      pending.add(new StreamConnectionRegistry.TenantTopic(tenantId, topic));
    }
  }

  /**
   * Records a change of an entity topic in every tenant watching it, for changes whose tenant
   * cannot be read without loading. Only entity topics qualify: they are granted only in the tenant
   * that owns the row, whereas a list topic exists in every tenant.
   */
  void recordWherever(StreamTopic topic) {
    if (!topic.isEntity()) {
      throw new IllegalArgumentException("a list topic needs its tenant: " + topic);
    }
    for (String tenantId : registry.tenantsWatching(topic)) {
      pending.add(new StreamConnectionRegistry.TenantTopic(tenantId, topic));
    }
  }

  /**
   * Records a change of a list topic in every tenant watching it, for a platform-level row that
   * every tenant's list shows (e.g. the connector catalog). A list topic is granted per tenant, so
   * only the sockets allowed to see that list in their own tenant receive it.
   */
  void recordInEveryTenant(StreamTopic topic) {
    if (topic.isEntity()) {
      throw new IllegalArgumentException("an entity topic is recorded wherever: " + topic);
    }
    for (String tenantId : registry.tenantsWatching(topic)) {
      pending.add(new StreamConnectionRegistry.TenantTopic(tenantId, topic));
    }
  }

  @Scheduled(fixedDelay = DRAIN_INTERVAL_MS)
  public void drain() {
    metrics.drainTime().record(this::drainPending);
  }

  private void drainPending() {
    Instant now = clock.instant();
    for (StreamConnectionRegistry.TenantTopic key : List.copyOf(pending)) {
      Instant last = lastSent.get(key);
      if (last != null && now.isBefore(last.plus(MIN_INTERVAL))) {
        continue;
      }
      pending.remove(key);
      lastSent.put(key, now);
      String message = StreamMessages.invalidate(key.topic());
      for (StreamConnection connection : registry.subscribers(key.tenantId(), key.topic())) {
        if (registry.send(connection, message)) {
          metrics.invalidationSent();
        }
      }
    }
    lastSent.values().removeIf(sentAt -> !now.isBefore(sentAt.plus(MIN_INTERVAL)));
  }
}
