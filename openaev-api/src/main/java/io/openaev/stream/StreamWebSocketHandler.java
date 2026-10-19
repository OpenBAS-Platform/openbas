package io.openaev.stream;

import io.openaev.context.TenantScopedTransaction;
import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator.OverflowStrategy;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * The stream endpoint. On open it registers the socket and sends {@code ready}; the only message it
 * accepts is {@code subscribe}, whose topics are authorized in the socket's tenant and replace the
 * socket's topic set, answered by {@code subscribed}. Anything else, or more than {@link
 * StreamConnection#MAX_SUBSCRIBES_PER_WINDOW} subscriptions per window, closes the socket with
 * {@link CloseStatus#POLICY_VIOLATION}. The socket never changes anything on the server.
 */
@Slf4j
public class StreamWebSocketHandler extends TextWebSocketHandler {

  static final int SEND_TIME_LIMIT_MS = 5_000;
  static final int SEND_BUFFER_LIMIT_BYTES = 64 * 1024;

  /** Entity topics granted per socket at most; topics over the cap are denied, not an error. */
  static final int MAX_ENTITY_TOPICS = 16;

  private final StreamConnectionRegistry registry;
  private final StreamTopicAuthorizer authorizer;
  private final TenantScopedTransaction tenantTx;
  private final StreamMetrics metrics;
  private final Clock clock;

  public StreamWebSocketHandler(
      StreamConnectionRegistry registry,
      StreamTopicAuthorizer authorizer,
      TenantScopedTransaction tenantTx,
      StreamMetrics metrics,
      Clock clock) {
    this.registry = registry;
    this.authorizer = authorizer;
    this.tenantTx = tenantTx;
    this.metrics = metrics;
    this.clock = clock;
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) {
    StreamConnection connection =
        new StreamConnection(
            new ConcurrentWebSocketSessionDecorator(
                session, SEND_TIME_LIMIT_MS, SEND_BUFFER_LIMIT_BYTES, OverflowStrategy.TERMINATE),
            (String) session.getAttributes().get(StreamHandshakeInterceptor.ATTR_USER_ID),
            (String) session.getAttributes().get(StreamHandshakeInterceptor.ATTR_TENANT_ID),
            (String) session.getAttributes().get(StreamHandshakeInterceptor.ATTR_HTTP_SESSION_ID));
    registry.register(connection);
    registry.send(connection, StreamMessages.ready());
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    Optional<StreamConnection> found = registry.get(session.getId());
    if (found.isEmpty()) {
      closeQuietly(session, CloseStatus.POLICY_VIOLATION);
      return;
    }
    StreamConnection connection = found.get();
    Optional<Set<String>> requested = StreamMessages.parseSubscribe(message.getPayload());
    if (requested.isEmpty() || !connection.tryAcquireSubscribe(clock.instant())) {
      registry.close(connection, CloseStatus.POLICY_VIOLATION);
      return;
    }

    Set<StreamTopic> known = new LinkedHashSet<>();
    int entityTopics = 0;
    for (String raw : requested.get()) {
      Optional<StreamTopic> topic = StreamTopic.parse(raw);
      if (topic.isEmpty()) {
        continue;
      }
      // Each entity topic costs a lookup per heartbeat: past the cap, the rest are denied.
      if (topic.get().isEntity() && ++entityTopics > MAX_ENTITY_TOPICS) {
        continue;
      }
      known.add(topic.get());
    }
    Set<StreamTopic> allowed;
    try {
      allowed =
          StreamTenantScope.execute(
              tenantTx,
              connection.tenantId(),
              () -> authorizer.allowedTopics(connection.userId(), connection.tenantId(), known));
    } catch (RuntimeException e) {
      log.warn("Stream subscription check failed: {}", e.getMessage(), e);
      registry.close(connection, CloseStatus.SERVER_ERROR);
      return;
    }
    registry.replaceTopics(connection, allowed);

    List<String> granted = new ArrayList<>();
    List<String> denied = new ArrayList<>();
    for (String raw : requested.get()) {
      boolean isGranted = StreamTopic.parse(raw).map(allowed::contains).orElse(false);
      (isGranted ? granted : denied).add(raw);
    }
    metrics.topics(granted.size(), denied.size());
    registry.send(connection, StreamMessages.subscribed(granted, denied));
  }

  @Override
  protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) {
    registry
        .get(session.getId())
        .ifPresentOrElse(
            connection -> registry.close(connection, CloseStatus.POLICY_VIOLATION),
            () -> closeQuietly(session, CloseStatus.POLICY_VIOLATION));
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    registry.remove(session.getId());
    metrics.socketClosed(status.getCode());
  }

  private static void closeQuietly(WebSocketSession session, CloseStatus status) {
    try {
      session.close(status);
    } catch (Exception e) {
      log.debug("Stream socket {} close failed: {}", session.getId(), e.getMessage());
    }
  }
}
