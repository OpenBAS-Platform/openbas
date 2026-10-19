package io.openaev.stream;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.handler.SessionLimitExceededException;

/**
 * The open sockets of this node, with a reverse index from a tenant and a topic to the sockets
 * granted that topic, so that an invalidation reaches exactly the sockets of the tenant the change
 * belongs to.
 *
 * <p>Every send goes through {@link #send}: a socket whose send fails, or that exceeds the limits
 * of its {@code ConcurrentWebSocketSessionDecorator}, is closed and forgotten without affecting the
 * others.
 */
@Slf4j
public class StreamConnectionRegistry {

  record TenantTopic(String tenantId, StreamTopic topic) {}

  private final Map<String, StreamConnection> connections = new ConcurrentHashMap<>();
  private final Map<TenantTopic, Set<StreamConnection>> subscribers = new ConcurrentHashMap<>();
  private final Map<StreamTopic, Set<String>> tenantsByTopic = new ConcurrentHashMap<>();

  public StreamConnectionRegistry(StreamMetrics metrics) {
    metrics.bindOpenSockets(connections::size);
  }

  void register(StreamConnection connection) {
    connections.put(connection.id(), connection);
  }

  Optional<StreamConnection> get(String socketId) {
    return Optional.ofNullable(connections.get(socketId));
  }

  Collection<StreamConnection> all() {
    return List.copyOf(connections.values());
  }

  /** Forgets the socket and its topics; a no-op for a socket already removed. */
  synchronized void remove(String socketId) {
    StreamConnection connection = connections.remove(socketId);
    if (connection != null) {
      unindex(connection);
    }
  }

  /**
   * Replaces the socket's whole topic set, as a {@code subscribe} does.
   *
   * @throws IllegalArgumentException when the set is over {@link StreamMessages#MAX_TOPICS}
   */
  synchronized void replaceTopics(StreamConnection connection, Set<StreamTopic> topics) {
    if (topics.size() > StreamMessages.MAX_TOPICS) {
      throw new IllegalArgumentException("too many topics: " + topics.size());
    }
    if (!connections.containsKey(connection.id())) {
      return;
    }
    unindex(connection);
    connection.topics(topics);
    for (StreamTopic topic : topics) {
      subscribers
          .computeIfAbsent(
              new TenantTopic(connection.tenantId(), topic), key -> ConcurrentHashMap.newKeySet())
          .add(connection);
      tenantsByTopic
          .computeIfAbsent(topic, key -> ConcurrentHashMap.newKeySet())
          .add(connection.tenantId());
    }
  }

  /** Drops the given topics from the socket, as a revoked right does. */
  synchronized void revokeTopics(StreamConnection connection, Set<StreamTopic> revoked) {
    Set<StreamTopic> kept =
        Set.copyOf(connection.topics().stream().filter(topic -> !revoked.contains(topic)).toList());
    replaceTopics(connection, kept);
  }

  /**
   * The tenants with at least one socket watching {@code topic}. Used for entity topics, whose
   * tenant a committed change cannot always tell without loading: the authorizer only grants an
   * entity topic in the tenant that owns the row, so its subscribers are in the right tenant. Also
   * used for the list topic of a platform-level row, which every tenant's list shows.
   */
  Set<String> tenantsWatching(StreamTopic topic) {
    Set<String> tenants = tenantsByTopic.get(topic);
    return tenants == null ? Set.of() : Set.copyOf(tenants);
  }

  boolean hasSubscribers(String tenantId, StreamTopic topic) {
    Set<StreamConnection> sockets = subscribers.get(new TenantTopic(tenantId, topic));
    return sockets != null && !sockets.isEmpty();
  }

  Collection<StreamConnection> subscribers(String tenantId, StreamTopic topic) {
    Set<StreamConnection> sockets = subscribers.get(new TenantTopic(tenantId, topic));
    return sockets == null ? List.of() : List.copyOf(sockets);
  }

  /**
   * Sends {@code payload} to the socket. On failure the socket is closed and removed, and {@code
   * false} is returned; the exception never reaches the caller.
   */
  boolean send(StreamConnection connection, String payload) {
    try {
      connection.session().sendMessage(new TextMessage(payload));
      return true;
    } catch (SessionLimitExceededException e) {
      log.debug("Stream socket {} too slow, closing it: {}", connection.id(), e.getMessage());
      close(connection, e.getStatus());
    } catch (IOException | RuntimeException e) {
      log.debug("Stream socket {} send failed, closing it: {}", connection.id(), e.getMessage());
      close(connection, CloseStatus.SESSION_NOT_RELIABLE);
    }
    return false;
  }

  /** Closes the socket with {@code status} and removes it. Never throws. */
  void close(StreamConnection connection, CloseStatus status) {
    remove(connection.id());
    try {
      connection.session().close(status);
    } catch (IOException | RuntimeException e) {
      log.debug("Stream socket {} close failed: {}", connection.id(), e.getMessage());
    }
  }

  private void unindex(StreamConnection connection) {
    for (StreamTopic topic : connection.topics()) {
      TenantTopic key = new TenantTopic(connection.tenantId(), topic);
      Set<StreamConnection> sockets = subscribers.get(key);
      if (sockets != null) {
        sockets.remove(connection);
        if (sockets.isEmpty()) {
          subscribers.remove(key);
          Set<String> tenants = tenantsByTopic.get(topic);
          if (tenants != null) {
            tenants.remove(connection.tenantId());
            if (tenants.isEmpty()) {
              tenantsByTopic.remove(topic);
            }
          }
        }
      }
    }
  }
}
