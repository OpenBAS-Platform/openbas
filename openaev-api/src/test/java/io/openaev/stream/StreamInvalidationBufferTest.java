package io.openaev.stream;

import static io.openaev.stream.StreamConnectionRegistryTest.connection;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;

@DisplayName("StreamInvalidationBuffer: pacing invalidations")
class StreamInvalidationBufferTest {

  private static final String TENANT_A = "tenant-a";
  private static final String TENANT_B = "tenant-b";
  private static final TextMessage INVALIDATE =
      new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_SCENARIOS));

  private SimpleMeterRegistry meterRegistry;
  private StreamConnectionRegistry registry;
  private MutableClock clock;
  private StreamInvalidationBuffer buffer;

  @BeforeEach
  void setUp() {
    meterRegistry = new SimpleMeterRegistry();
    StreamMetrics metrics = new StreamMetrics(meterRegistry);
    registry = new StreamConnectionRegistry(metrics);
    clock = new MutableClock(Instant.parse("2026-10-07T10:00:00Z"));
    buffer = new StreamInvalidationBuffer(registry, metrics, clock);
  }

  private StreamConnection subscribed(String id, String tenantId) {
    StreamConnection socket = connection(id, tenantId);
    registry.register(socket);
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_SCENARIOS));
    return socket;
  }

  private double invalidationsSent() {
    return meterRegistry.get("openaev.stream.ws.invalidations.sent").counter().count();
  }

  @Test
  @DisplayName("a thousand records in one drain send one message")
  void given_thousandRecords_should_sendOneMessage() throws IOException {
    // Arrange
    StreamConnection socket = subscribed("s1", TENANT_A);
    for (int i = 0; i < 1000; i++) {
      buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    }

    // Act
    buffer.drain();
    buffer.drain();

    // Assert
    verify(socket.session(), times(1)).sendMessage(INVALIDATE);
    assertThat(invalidationsSent()).isEqualTo(1);
  }

  @Test
  @DisplayName("a topic sent less than 2 s ago waits for the rest of the interval")
  void given_recentSend_should_waitForInterval() throws IOException {
    // Arrange
    StreamConnection socket = subscribed("s1", TENANT_A);
    buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    buffer.drain();

    // Act: changes keep coming during the interval
    clock.advance(Duration.ofMillis(250));
    buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    buffer.drain();
    clock.advance(Duration.ofMillis(1500));
    buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    buffer.drain();

    // Assert: still only the first message
    verify(socket.session(), times(1)).sendMessage(INVALIDATE);

    // Act: the interval elapses
    clock.advance(Duration.ofMillis(250));
    buffer.drain();

    // Assert: one message for everything that happened meanwhile
    verify(socket.session(), times(2)).sendMessage(INVALIDATE);
    buffer.drain();
    verify(socket.session(), times(2)).sendMessage(INVALIDATE);
  }

  @Test
  @DisplayName("a drain with nothing pending sends nothing, even after the interval")
  void given_nothingPending_should_sendNothing() throws IOException {
    StreamConnection socket = subscribed("s1", TENANT_A);
    buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    buffer.drain();

    clock.advance(Duration.ofSeconds(5));
    buffer.drain();

    verify(socket.session(), times(1)).sendMessage(INVALIDATE);
  }

  @Test
  @DisplayName("only subscribed sockets of the tenant receive")
  void given_mixedSockets_should_reachOnlySubscribersOfTheTenant() throws IOException {
    // Arrange
    StreamConnection subscriberA = subscribed("a1", TENANT_A);
    StreamConnection unsubscribedA = connection("a2", TENANT_A);
    registry.register(unsubscribedA);
    StreamConnection subscriberB = subscribed("b1", TENANT_B);

    // Act
    buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    buffer.drain();

    // Assert
    verify(subscriberA.session()).sendMessage(INVALIDATE);
    verify(unsubscribedA.session(), never()).sendMessage(any());
    verify(subscriberB.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("a socket whose send fails is closed while the others still receive")
  void given_failingSocket_should_closeItAndKeepSendingToOthers() throws IOException {
    // Arrange
    StreamConnection broken = subscribed("broken", TENANT_A);
    StreamConnection healthy = subscribed("healthy", TENANT_A);
    doThrow(new IOException("broken pipe")).when(broken.session()).sendMessage(any());

    // Act
    buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    buffer.drain();

    // Assert
    verify(healthy.session()).sendMessage(INVALIDATE);
    verify(broken.session()).close(CloseStatus.SESSION_NOT_RELIABLE);
    assertThat(registry.get(broken.id())).isEmpty();
    assertThat(registry.subscribers(TENANT_A, StreamTopic.LIST_SCENARIOS)).containsExactly(healthy);
    assertThat(invalidationsSent()).isEqualTo(1);
  }

  @Test
  @DisplayName("nothing is recorded without a subscriber")
  void given_noSubscriber_should_recordNothing() throws IOException {
    // Arrange: a change while nobody listens
    buffer.record(TENANT_A, StreamTopic.LIST_SCENARIOS);
    StreamConnection lateSubscriber = subscribed("late", TENANT_A);

    // Act
    buffer.drain();

    // Assert
    verify(lateSubscriber.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("an entity topic is paced per topic, apart from the list and from other entities")
  void given_entityTopics_should_bePacedPerTopic() throws IOException {
    // Arrange
    StreamTopic first = StreamTopic.atomicTesting("3f2504e0-4f89-11d3-9a0c-0305e82c3301");
    StreamTopic second = StreamTopic.atomicTesting("3f2504e0-4f89-11d3-9a0c-0305e82c3302");
    StreamConnection socket = connection("s1", TENANT_A);
    registry.register(socket);
    registry.replaceTopics(socket, Set.of(StreamTopic.LIST_ATOMIC_TESTINGS, first, second));

    // Act
    for (int i = 0; i < 100; i++) {
      buffer.record(TENANT_A, StreamTopic.LIST_ATOMIC_TESTINGS);
      buffer.recordWherever(first);
    }
    buffer.recordWherever(second);
    buffer.drain();

    // Assert
    verify(socket.session(), times(1))
        .sendMessage(new TextMessage(StreamMessages.invalidate(StreamTopic.LIST_ATOMIC_TESTINGS)));
    verify(socket.session(), times(1))
        .sendMessage(new TextMessage(StreamMessages.invalidate(first)));
    verify(socket.session(), times(1))
        .sendMessage(new TextMessage(StreamMessages.invalidate(second)));
    assertThat(invalidationsSent()).isEqualTo(3);
  }

  @Test
  @DisplayName("an entity topic recorded without its tenant reaches only the tenants watching it")
  void given_entityTopicWithoutTenant_should_reachWatchingTenantsOnly() throws IOException {
    // Arrange
    StreamTopic topic = StreamTopic.atomicTesting("3f2504e0-4f89-11d3-9a0c-0305e82c3301");
    StreamConnection watcher = connection("a1", TENANT_A);
    registry.register(watcher);
    registry.replaceTopics(watcher, Set.of(topic));
    StreamConnection listWatcherB = connection("b1", TENANT_B);
    registry.register(listWatcherB);
    registry.replaceTopics(listWatcherB, Set.of(StreamTopic.LIST_ATOMIC_TESTINGS));

    // Act
    buffer.recordWherever(topic);
    buffer.drain();

    // Assert
    verify(watcher.session()).sendMessage(new TextMessage(StreamMessages.invalidate(topic)));
    verify(listWatcherB.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("a list topic cannot be recorded without its tenant")
  void given_listTopicWithoutTenant_should_beRefused() {
    assertThatThrownBy(() -> buffer.recordWherever(StreamTopic.LIST_ATOMIC_TESTINGS))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  @DisplayName("a list topic recorded in every tenant reaches each tenant watching it")
  void given_listTopicInEveryTenant_should_reachEachWatchingTenant() throws IOException {
    // Arrange
    StreamTopic topic = StreamTopic.LIST_INTEGRATIONS;
    StreamConnection watcherA = connection("a1", TENANT_A);
    registry.register(watcherA);
    registry.replaceTopics(watcherA, Set.of(topic));
    StreamConnection watcherB = connection("b1", TENANT_B);
    registry.register(watcherB);
    registry.replaceTopics(watcherB, Set.of(topic));
    StreamConnection scenariosWatcherB = subscribed("b2", TENANT_B);

    // Act
    buffer.recordInEveryTenant(topic);
    buffer.drain();

    // Assert
    TextMessage invalidate = new TextMessage(StreamMessages.invalidate(topic));
    verify(watcherA.session()).sendMessage(invalidate);
    verify(watcherB.session()).sendMessage(invalidate);
    verify(scenariosWatcherB.session(), never()).sendMessage(any());
  }

  @Test
  @DisplayName("an entity topic cannot be recorded in every tenant")
  void given_entityTopicInEveryTenant_should_beRefused() {
    assertThatThrownBy(
            () ->
                buffer.recordInEveryTenant(
                    StreamTopic.team("3f2504e0-4f89-11d3-9a0c-0305e82c3301")))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
