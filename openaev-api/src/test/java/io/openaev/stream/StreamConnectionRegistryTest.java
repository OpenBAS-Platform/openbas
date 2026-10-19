package io.openaev.stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.io.IOException;
import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@DisplayName("StreamConnectionRegistry: sockets, topics and their reverse index")
class StreamConnectionRegistryTest {

  private static final String TENANT_A = "tenant-a";
  private static final String TENANT_B = "tenant-b";

  private SimpleMeterRegistry meterRegistry;
  private StreamConnectionRegistry registry;

  @BeforeEach
  void setUp() {
    meterRegistry = new SimpleMeterRegistry();
    registry = new StreamConnectionRegistry(new StreamMetrics(meterRegistry));
  }

  static WebSocketSession session(String id) {
    WebSocketSession session = mock(WebSocketSession.class);
    when(session.getId()).thenReturn(id);
    when(session.isOpen()).thenReturn(true);
    return session;
  }

  static StreamConnection connection(String id, String tenantId) {
    return new StreamConnection(session(id), "user-" + id, tenantId, "http-" + id);
  }

  @Test
  @DisplayName("a subscribe replaces the whole topic set and the index follows")
  void given_subscribe_should_replaceTopicSet() {
    // Arrange
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);

    // Act
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));

    // Assert
    assertThat(socket.topics()).containsExactly(StreamTopic.LIST_SCENARIOS);
    assertThat(registry.hasSubscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).isTrue();
    assertThat(registry.subscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).containsExactly(socket);
    assertThat(registry.hasSubscribers(TENANT_B, StreamTopic.LIST_SCENARIOS)).isFalse();

    // Act
    registry.replaceTopics(socket, Set.of());

    // Assert
    assertThat(socket.topics()).isEmpty();
    assertThat(registry.hasSubscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).isFalse();
  }

  @Test
  @DisplayName("the index is per tenant")
  void given_twoTenants_should_indexEachSocketUnderItsOwnTenant() {
    StreamConnection socketA = connection("a", TENANT_A);
    StreamConnection socketB = connection("b", TENANT_B);
    registry.register(socketA);
    registry.register(socketB);

    registry.replaceTopics(socketA, Set.of(StreamTopic.LIST_SCENARIOS));
    registry.replaceTopics(socketB, Set.of(StreamTopic.LIST_SCENARIOS));

    assertThat(registry.subscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).containsExactly(socketA);
    assertThat(registry.subscribers(TENANT_B, StreamTopic.LIST_SCENARIOS)).containsExactly(socketB);
  }

  @Test
  @DisplayName("a revoked topic leaves the socket and the index")
  void given_revokedTopic_should_dropIt() {
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));

    registry.revokeTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));

    assertThat(socket.topics()).isEmpty();
    assertThat(registry.hasSubscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).isFalse();
  }

  @Test
  @DisplayName("a topic set over the cap is refused")
  void given_tooManyTopics_should_refuse() {
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);
    Set<StreamTopic> tooMany = mock(Set.class);
    when(tooMany.size()).thenReturn(StreamMessages.MAX_TOPICS + 1);

    assertThatThrownBy(() -> registry.replaceTopics(socket, tooMany))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  @DisplayName("subscriptions are capped per window")
  void given_subscribeBurst_should_capAtTenPerTenSeconds() {
    StreamConnection socket = connection("s1", TENANT_A);
    Instant start = Instant.parse("2026-10-07T10:00:00Z");

    for (int i = 0; i < StreamConnection.MAX_SUBSCRIBES_PER_WINDOW; i++) {
      assertThat(socket.tryAcquireSubscribe(start.plusMillis(i))).isTrue();
    }

    assertThat(socket.tryAcquireSubscribe(start.plusSeconds(9))).isFalse();
    assertThat(socket.tryAcquireSubscribe(start.plusSeconds(10).plusMillis(1))).isTrue();
  }

  @Test
  @DisplayName("a closed socket is removed with its topics")
  void given_closedSocket_should_beRemoved() {
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));

    registry.remove(socket.id());

    assertThat(registry.get(socket.id())).isEmpty();
    assertThat(registry.all()).isEmpty();
    assertThat(registry.hasSubscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).isFalse();
    assertThat(meterRegistry.get("openaev.stream.ws.sockets.open").gauge().value()).isZero();
  }

  @Test
  @DisplayName("a removed socket cannot be subscribed again")
  void given_removedSocket_should_notBeIndexed() {
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);
    registry.remove(socket.id());

    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));

    assertThat(registry.hasSubscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).isFalse();
  }

  @Test
  @DisplayName("a failed send closes and removes the socket without throwing")
  void given_failingSend_should_closeAndRemove() throws IOException {
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));
    doThrow(new IOException("broken pipe")).when(socket.session()).sendMessage(any());

    boolean sent = registry.send(socket, StreamMessages.heartbeat());

    assertThat(sent).isFalse();
    assertThat(registry.get(socket.id())).isEmpty();
    assertThat(registry.hasSubscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).isFalse();
    verify(socket.session()).close(CloseStatus.SESSION_NOT_RELIABLE);
  }

  @Test
  @DisplayName("a successful send reaches the socket")
  void given_openSocket_should_send() throws IOException {
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);

    assertThat(registry.send(socket, StreamMessages.heartbeat())).isTrue();
    verify(socket.session()).sendMessage(new TextMessage(StreamMessages.heartbeat()));
  }

  @Test
  @DisplayName("tenantsWatching follows the sockets watching an entity topic")
  void given_entityTopic_should_trackWatchingTenants() {
    StreamTopic topic = StreamTopic.atomicTesting("3f2504e0-4f89-11d3-9a0c-0305e82c3301");
    StreamConnection socketA = connection("a", TENANT_A);
    StreamConnection otherSocketA = connection("a2", TENANT_A);
    registry.register(socketA);
    registry.register(otherSocketA);
    registry.replaceTopics(socketA, Set.of(topic));
    registry.replaceTopics(otherSocketA, Set.of(topic));

    assertThat(registry.tenantsWatching(topic)).containsExactly(TENANT_A);
    assertThat(registry.tenantsWatching(StreamTopic.LIST_SCENARIOS)).isEmpty();

    registry.remove(socketA.id());
    assertThat(registry.tenantsWatching(topic)).containsExactly(TENANT_A);

    registry.revokeTopics(otherSocketA, Set.of(topic));
    assertThat(registry.tenantsWatching(topic)).isEmpty();
  }
}
