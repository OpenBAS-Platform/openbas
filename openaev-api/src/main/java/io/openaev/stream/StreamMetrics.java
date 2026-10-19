package io.openaev.stream;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.function.Supplier;

/** Micrometer meters of the live-invalidation stream, all under {@code openaev.stream.ws}. */
public class StreamMetrics {

  static final String PREFIX = "openaev.stream.ws";

  private final MeterRegistry registry;
  private final Counter topicsGranted;
  private final Counter topicsDenied;
  private final Counter invalidationsSent;
  private final Counter listenerFailures;
  private final Timer drainTime;
  private final Timer heartbeatTime;

  public StreamMetrics(MeterRegistry registry) {
    this.registry = registry;
    this.topicsGranted = registry.counter(PREFIX + ".topics", "outcome", "granted");
    this.topicsDenied = registry.counter(PREFIX + ".topics", "outcome", "denied");
    this.invalidationsSent = registry.counter(PREFIX + ".invalidations.sent");
    this.listenerFailures = registry.counter(PREFIX + ".listener.failures");
    this.drainTime = registry.timer(PREFIX + ".drain");
    this.heartbeatTime = registry.timer(PREFIX + ".heartbeat");
  }

  /** Exposes the number of open sockets, read from {@code openSockets} at each scrape. */
  void bindOpenSockets(Supplier<Number> openSockets) {
    Gauge.builder(PREFIX + ".sockets.open", openSockets).register(registry);
  }

  void handshakeRefused(String reason) {
    registry.counter(PREFIX + ".handshakes.refused", "reason", reason).increment();
  }

  void topics(int granted, int denied) {
    topicsGranted.increment(granted);
    topicsDenied.increment(denied);
  }

  void invalidationSent() {
    invalidationsSent.increment();
  }

  void socketClosed(int code) {
    registry.counter(PREFIX + ".sockets.closed", "code", Integer.toString(code)).increment();
  }

  void listenerFailure() {
    listenerFailures.increment();
  }

  Timer drainTime() {
    return drainTime;
  }

  Timer heartbeatTime() {
    return heartbeatTime;
  }
}
