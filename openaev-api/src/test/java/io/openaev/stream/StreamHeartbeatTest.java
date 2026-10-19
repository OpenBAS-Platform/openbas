package io.openaev.stream;

import static io.openaev.stream.StreamConnectionRegistryTest.connection;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.openaev.config.cache.TenantMembershipCacheManager;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import java.io.IOException;
import java.util.Set;
import java.util.function.Supplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.session.MapSession;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.web.socket.TextMessage;

@DisplayName("StreamHeartbeat: keep-alive and revocation")
class StreamHeartbeatTest {

  private static final String TENANT_ID = "tenant-a";
  private static final TextMessage HEARTBEAT = new TextMessage(StreamMessages.heartbeat());

  private StreamConnectionRegistry registry;
  private StreamTopicAuthorizer authorizer;
  private TenantMembershipCacheManager membership;
  private SessionRepository<Session> sessionRepository;
  private StreamHeartbeat heartbeat;
  private StreamConnection socket;

  @BeforeEach
  @SuppressWarnings("unchecked")
  void setUp() {
    StreamMetrics metrics = new StreamMetrics(new SimpleMeterRegistry());
    registry = new StreamConnectionRegistry(metrics);
    authorizer = mock(StreamTopicAuthorizer.class);
    membership = mock(TenantMembershipCacheManager.class);
    sessionRepository = mock(SessionRepository.class);
    TenantScopedTransaction tenantTx = mock(TenantScopedTransaction.class);
    when(tenantTx.execute(any(TxCtx.class), any(Supplier.class)))
        .thenAnswer(invocation -> ((Supplier<?>) invocation.getArgument(1)).get());
    heartbeat =
        new StreamHeartbeat(registry, authorizer, membership, sessionRepository, tenantTx, metrics);

    socket = connection("s1", TENANT_ID);
    registry.register(socket);
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));
    when(sessionRepository.findById(socket.httpSessionId())).thenReturn(new MapSession());
    when(membership.existsByUserIdAndTenantId(socket.userId(), TENANT_ID)).thenReturn(true);
    when(authorizer.allowedTopics(eq(socket.userId()), eq(TENANT_ID), anyCollection()))
        .thenReturn(Set.of(StreamTopic.LIST_SCENARIOS));
  }

  @Test
  @DisplayName("a healthy socket receives a heartbeat and keeps its topics")
  void given_healthySocket_should_receiveHeartbeat() throws IOException {
    heartbeat.beat();

    verify(socket.session()).sendMessage(HEARTBEAT);
    verify(socket.session(), never()).close(any());
    assertThat(registry.hasSubscribers(TENANT_ID, StreamTopic.LIST_SCENARIOS)).isTrue();
  }

  @Test
  @DisplayName("a deleted session closes the socket with 4401")
  void given_deletedSession_should_closeWith4401() throws IOException {
    when(sessionRepository.findById(socket.httpSessionId())).thenReturn(null);

    heartbeat.beat();

    verify(socket.session()).close(StreamHeartbeat.SESSION_ENDED);
    assertThat(StreamHeartbeat.SESSION_ENDED.getCode()).isEqualTo(4401);
    assertThat(registry.get(socket.id())).isEmpty();
  }

  @Test
  @DisplayName("a removed membership closes the socket with 4403")
  void given_removedMembership_should_closeWith4403() throws IOException {
    when(membership.existsByUserIdAndTenantId(socket.userId(), TENANT_ID)).thenReturn(false);

    heartbeat.beat();

    verify(socket.session()).close(StreamHeartbeat.NOT_A_MEMBER);
    assertThat(StreamHeartbeat.NOT_A_MEMBER.getCode()).isEqualTo(4403);
    assertThat(registry.get(socket.id())).isEmpty();
  }

  @Test
  @DisplayName("a removed capability brings subscription-revoked")
  void given_removedCapability_should_revokeTopic() throws IOException {
    when(authorizer.allowedTopics(eq(socket.userId()), eq(TENANT_ID), anyCollection()))
        .thenReturn(Set.of());

    heartbeat.beat();

    verify(socket.session())
        .sendMessage(
            new TextMessage(
                StreamMessages.subscriptionRevoked(Set.of(StreamTopic.LIST_SCENARIOS))));
    verify(socket.session(), never()).close(any());
    assertThat(socket.topics()).isEmpty();
    assertThat(registry.hasSubscribers(TENANT_ID, StreamTopic.LIST_SCENARIOS)).isFalse();
  }

  @Test
  @DisplayName("a failing check leaves the socket as it is")
  void given_failingCheck_should_keepSocket() throws IOException {
    when(membership.existsByUserIdAndTenantId(socket.userId(), TENANT_ID))
        .thenThrow(new IllegalStateException("db down"));

    heartbeat.beat();

    verify(socket.session(), never()).close(any());
    assertThat(registry.hasSubscribers(TENANT_ID, StreamTopic.LIST_SCENARIOS)).isTrue();
  }

  @Test
  @DisplayName("an atomic testing that went away has its topic revoked, the others stay")
  void given_deniedEntityTopic_should_revokeItOnly() throws IOException {
    // Arrange: the authorizer now denies the entity topic (row deleted or no longer readable)
    StreamTopic detail = StreamTopic.atomicTesting("3f2504e0-4f89-11d3-9a0c-0305e82c3301");
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS, detail));
    when(authorizer.allowedTopics(eq(socket.userId()), eq(TENANT_ID), anyCollection()))
        .thenReturn(Set.of(StreamTopic.LIST_SCENARIOS));

    // Act
    heartbeat.beat();

    // Assert
    verify(socket.session())
        .sendMessage(new TextMessage(StreamMessages.subscriptionRevoked(Set.of(detail))));
    assertThat(socket.topics()).containsExactly(StreamTopic.LIST_SCENARIOS);
    assertThat(registry.tenantsWatching(detail)).isEmpty();
  }
}
