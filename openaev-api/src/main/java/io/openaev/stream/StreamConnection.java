package io.openaev.stream;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Set;
import org.springframework.web.socket.WebSocketSession;

/**
 * One open socket and what it is bound to: the user, the tenant from the handshake URL, the HTTP
 * session that authenticated it (checked again at each heartbeat, never sent anywhere) and the
 * topics it was granted.
 */
final class StreamConnection {

  static final int MAX_SUBSCRIBES_PER_WINDOW = 10;
  static final Duration SUBSCRIBE_WINDOW = Duration.ofSeconds(10);

  private final WebSocketSession session;
  private final String userId;
  private final String tenantId;
  private final String httpSessionId;
  private final Deque<Instant> recentSubscribes = new ArrayDeque<>();
  private volatile Set<StreamTopic> topics = Set.of();

  StreamConnection(WebSocketSession session, String userId, String tenantId, String httpSessionId) {
    this.session = session;
    this.userId = userId;
    this.tenantId = tenantId;
    this.httpSessionId = httpSessionId;
  }

  String id() {
    return session.getId();
  }

  WebSocketSession session() {
    return session;
  }

  String userId() {
    return userId;
  }

  String tenantId() {
    return tenantId;
  }

  String httpSessionId() {
    return httpSessionId;
  }

  Set<StreamTopic> topics() {
    return topics;
  }

  void topics(Set<StreamTopic> topics) {
    this.topics = Set.copyOf(topics);
  }

  /**
   * Records a {@code subscribe} at {@code now} and tells whether it stays within {@link
   * #MAX_SUBSCRIBES_PER_WINDOW} per {@link #SUBSCRIBE_WINDOW}.
   */
  synchronized boolean tryAcquireSubscribe(Instant now) {
    Instant windowStart = now.minus(SUBSCRIBE_WINDOW);
    while (!recentSubscribes.isEmpty() && !recentSubscribes.peekFirst().isAfter(windowStart)) {
      recentSubscribes.pollFirst();
    }
    if (recentSubscribes.size() >= MAX_SUBSCRIBES_PER_WINDOW) {
      return false;
    }
    recentSubscribes.addLast(now);
    return true;
  }
}
