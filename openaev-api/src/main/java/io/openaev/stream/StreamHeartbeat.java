package io.openaev.stream;

import io.openaev.config.cache.TenantMembershipCacheManager;
import io.openaev.context.TenantScopedTransaction;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.web.socket.CloseStatus;

/**
 * Keeps sockets alive and re-checks, at every beat, what the handshake and the subscription checked
 * once:
 *
 * <ul>
 *   <li>the HTTP session still exists (read without extending it), or the socket closes with {@link
 *       #SESSION_ENDED};
 *   <li>the user is still a member of the tenant, or the socket closes with {@link #NOT_A_MEMBER};
 *   <li>each granted topic is still allowed, or it is dropped and the client receives {@code
 *       subscription-revoked}.
 * </ul>
 *
 * Checks are grouped per user and tenant, so that the tabs of one user cost one transaction.
 */
@Slf4j
public class StreamHeartbeat {

  static final CloseStatus SESSION_ENDED = new CloseStatus(4401, "session ended");
  static final CloseStatus NOT_A_MEMBER = new CloseStatus(4403, "not a member of the tenant");

  private final StreamConnectionRegistry registry;
  private final StreamTopicAuthorizer authorizer;
  private final TenantMembershipCacheManager tenantMembershipCacheManager;
  private final SessionRepository<? extends Session> sessionRepository;
  private final TenantScopedTransaction tenantTx;
  private final StreamMetrics metrics;

  public StreamHeartbeat(
      StreamConnectionRegistry registry,
      StreamTopicAuthorizer authorizer,
      TenantMembershipCacheManager tenantMembershipCacheManager,
      SessionRepository<? extends Session> sessionRepository,
      TenantScopedTransaction tenantTx,
      StreamMetrics metrics) {
    this.registry = registry;
    this.authorizer = authorizer;
    this.tenantMembershipCacheManager = tenantMembershipCacheManager;
    this.sessionRepository = sessionRepository;
    this.tenantTx = tenantTx;
    this.metrics = metrics;
  }

  @Scheduled(
      fixedDelayString = "${openaev.stream.heartbeat-interval:25s}",
      initialDelayString = "${openaev.stream.heartbeat-interval:25s}")
  public void beat() {
    metrics.heartbeatTime().record(this::beatAll);
  }

  private void beatAll() {
    String heartbeat = StreamMessages.heartbeat();
    List<StreamConnection> alive =
        registry.all().stream()
            .filter(connection -> registry.send(connection, heartbeat))
            .filter(this::sessionStillExists)
            .toList();
    Map<UserTenant, List<StreamConnection>> byUserTenant =
        alive.stream()
            .collect(
                Collectors.groupingBy(
                    connection -> new UserTenant(connection.userId(), connection.tenantId()),
                    LinkedHashMap::new,
                    Collectors.toList()));
    byUserTenant.forEach(this::recheck);
  }

  private boolean sessionStillExists(StreamConnection connection) {
    try {
      if (sessionRepository.findById(connection.httpSessionId()) != null) {
        return true;
      }
      registry.close(connection, SESSION_ENDED);
    } catch (RuntimeException e) {
      log.warn("Stream session check failed: {}", e.getMessage(), e);
    }
    return false;
  }

  private void recheck(UserTenant userTenant, List<StreamConnection> connections) {
    Map<StreamConnection, Set<StreamTopic>> topicsBefore = new LinkedHashMap<>();
    Set<StreamTopic> granted = new HashSet<>();
    for (StreamConnection connection : connections) {
      topicsBefore.put(connection, connection.topics());
      granted.addAll(connection.topics());
    }
    Check check;
    try {
      check =
          StreamTenantScope.execute(
              tenantTx,
              userTenant.tenantId(),
              () -> {
                if (!tenantMembershipCacheManager.existsByUserIdAndTenantId(
                    userTenant.userId(), userTenant.tenantId())) {
                  return new Check(false, Set.of());
                }
                return new Check(
                    true,
                    authorizer.allowedTopics(userTenant.userId(), userTenant.tenantId(), granted));
              });
    } catch (RuntimeException e) {
      log.warn("Stream heartbeat check failed: {}", e.getMessage(), e);
      return;
    }
    topicsBefore.forEach(
        (connection, topics) -> {
          if (!check.member()) {
            registry.close(connection, NOT_A_MEMBER);
            return;
          }
          // Only topics held before the check are judged by it: a subscribe that raced with this
          // beat was authorized on its own.
          Set<StreamTopic> revoked = new LinkedHashSet<>();
          topics.stream().filter(topic -> !check.allowed().contains(topic)).forEach(revoked::add);
          if (!revoked.isEmpty()) {
            registry.revokeTopics(connection, revoked);
            registry.send(connection, StreamMessages.subscriptionRevoked(revoked));
          }
        });
  }

  private record UserTenant(String userId, String tenantId) {}

  private record Check(boolean member, Set<StreamTopic> allowed) {}
}
