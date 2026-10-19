package io.openaev.stream;

import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.openaev.context.TenantContext;
import io.openaev.context.TenantScopedTransaction;
import io.openaev.context.TxCtx;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

@DisplayName("StreamWebSocketHandler: ready, subscribe and the strict protocol")
class StreamWebSocketHandlerTest {

  private static final String TENANT_ID = "tenant-a";
  private static final String USER_ID = "user-a";

  private StreamConnectionRegistry registry;
  private StreamTopicAuthorizer authorizer;
  private TenantScopedTransaction tenantTx;
  private StreamWebSocketHandler handler;
  private WebSocketSession session;
  private final AtomicReference<TxCtx> lastScope = new AtomicReference<>();
  private final AtomicReference<String> tenantContextSeen = new AtomicReference<>();

  @BeforeEach
  @SuppressWarnings("unchecked")
  void setUp() {
    StreamMetrics metrics = new StreamMetrics(new SimpleMeterRegistry());
    registry = new StreamConnectionRegistry(metrics);
    authorizer = mock(StreamTopicAuthorizer.class);
    tenantTx = mock(TenantScopedTransaction.class);
    when(tenantTx.execute(any(TxCtx.class), any(Supplier.class)))
        .thenAnswer(
            invocation -> {
              lastScope.set(invocation.getArgument(0));
              tenantContextSeen.set(TenantContext.getCurrentTenant());
              return ((Supplier<?>) invocation.getArgument(1)).get();
            });
    handler =
        new StreamWebSocketHandler(
            registry,
            authorizer,
            tenantTx,
            metrics,
            new MutableClock(Instant.parse("2026-10-07T10:00:00Z")));

    session = mock(WebSocketSession.class);
    Map<String, Object> attributes = new HashMap<>();
    attributes.put(StreamHandshakeInterceptor.ATTR_USER_ID, USER_ID);
    attributes.put(StreamHandshakeInterceptor.ATTR_TENANT_ID, TENANT_ID);
    attributes.put(StreamHandshakeInterceptor.ATTR_HTTP_SESSION_ID, "http-session");
    when(session.getId()).thenReturn("socket-1");
    when(session.isOpen()).thenReturn(true);
    when(session.getAttributes()).thenReturn(attributes);
  }

  private List<String> sent() throws IOException {
    ArgumentCaptor<WebSocketMessage<?>> captor = ArgumentCaptor.forClass(WebSocketMessage.class);
    verify(session, atLeast(0)).sendMessage(captor.capture());
    List<String> payloads = new ArrayList<>();
    captor.getAllValues().forEach(message -> payloads.add((String) message.getPayload()));
    return payloads;
  }

  private void subscribe(String topicsJson) throws Exception {
    handler.handleMessage(
        session, new TextMessage("{\"type\":\"subscribe\",\"topics\":" + topicsJson + "}"));
  }

  @Test
  @DisplayName("an opened socket is registered and receives ready")
  void given_open_should_registerAndSendReady() throws Exception {
    handler.afterConnectionEstablished(session);

    assertThat(registry.get("socket-1")).isPresent();
    assertThat(sent()).hasSize(1);
    assertThatJson(sent().getFirst()).isEqualTo("{\"type\":\"ready\",\"protocol\":1}");
  }

  @Test
  @DisplayName("subscribe is authorized in the socket's tenant and answered with subscribed")
  void given_subscribe_should_answerGrantedAndDenied() throws Exception {
    // Arrange
    handler.afterConnectionEstablished(session);
    when(authorizer.allowedTopics(eq(USER_ID), eq(TENANT_ID), anyCollection()))
        .thenReturn(Set.of(StreamTopic.LIST_SCENARIOS));

    // Act
    subscribe("[\"list:scenarios\",\"list:simulations\"]");

    // Assert
    assertThat(lastScope.get()).isEqualTo(TxCtx.forTenant(TENANT_ID));
    assertThat(tenantContextSeen.get()).isEqualTo(TENANT_ID);
    assertThat(TenantContext.hasCurrentTenant()).isFalse();
    assertThatJson(sent().getLast())
        .isEqualTo(
            "{\"type\":\"subscribed\",\"granted\":[\"list:scenarios\"],"
                + "\"denied\":[\"list:simulations\"]}");
    assertThat(registry.subscribers(TENANT_ID, StreamTopic.LIST_SCENARIOS)).hasSize(1);
  }

  @Test
  @DisplayName("a denied topic is reported and not indexed")
  void given_deniedTopic_should_notIndex() throws Exception {
    handler.afterConnectionEstablished(session);
    when(authorizer.allowedTopics(eq(USER_ID), eq(TENANT_ID), anyCollection()))
        .thenReturn(Set.of());

    subscribe("[\"list:scenarios\"]");

    assertThatJson(sent().getLast())
        .isEqualTo("{\"type\":\"subscribed\",\"granted\":[],\"denied\":[\"list:scenarios\"]}");
    assertThat(registry.hasSubscribers(TENANT_ID, StreamTopic.LIST_SCENARIOS)).isFalse();
  }

  @Test
  @DisplayName("a new subscribe replaces the previous set")
  void given_secondSubscribe_should_replaceSet() throws Exception {
    handler.afterConnectionEstablished(session);
    when(authorizer.allowedTopics(eq(USER_ID), eq(TENANT_ID), anyCollection()))
        .thenReturn(Set.of(StreamTopic.LIST_SCENARIOS))
        .thenReturn(Set.of());

    subscribe("[\"list:scenarios\"]");
    subscribe("[]");

    assertThat(registry.hasSubscribers(TENANT_ID, StreamTopic.LIST_SCENARIOS)).isFalse();
  }

  @Test
  @DisplayName("a malformed message closes the socket with 1008")
  void given_malformedMessage_should_closeWithPolicyViolation() throws Exception {
    handler.afterConnectionEstablished(session);

    handler.handleMessage(session, new TextMessage("{\"type\":\"hello\"}"));

    verify(session).close(CloseStatus.POLICY_VIOLATION);
    assertThat(registry.get("socket-1")).isEmpty();
    verify(tenantTx, never()).execute(any(TxCtx.class), any(Supplier.class));
  }

  @Test
  @DisplayName("a binary message closes the socket with 1008")
  void given_binaryMessage_should_closeWithPolicyViolation() throws Exception {
    handler.afterConnectionEstablished(session);

    handler.handleMessage(session, new BinaryMessage(ByteBuffer.wrap(new byte[] {1, 2})));

    verify(session).close(CloseStatus.POLICY_VIOLATION);
  }

  @Test
  @DisplayName("an eleventh subscribe within 10 s closes the socket with 1008")
  void given_eleventhSubscribe_should_closeWithPolicyViolation() throws Exception {
    handler.afterConnectionEstablished(session);
    when(authorizer.allowedTopics(eq(USER_ID), eq(TENANT_ID), anyCollection()))
        .thenReturn(Set.of());

    for (int i = 0; i < StreamConnection.MAX_SUBSCRIBES_PER_WINDOW; i++) {
      subscribe("[]");
    }
    verify(session, never()).close(any());

    subscribe("[]");

    verify(session).close(CloseStatus.POLICY_VIOLATION);
  }

  @Test
  @DisplayName("a failing authorization closes the socket with 1011")
  void given_failingAuthorization_should_closeWithServerError() throws Exception {
    handler.afterConnectionEstablished(session);
    when(authorizer.allowedTopics(eq(USER_ID), eq(TENANT_ID), anyCollection()))
        .thenThrow(new IllegalStateException("db down"));

    subscribe("[\"list:scenarios\"]");

    verify(session).close(CloseStatus.SERVER_ERROR);
    assertThat(TenantContext.hasCurrentTenant()).isFalse();
  }

  @Test
  @DisplayName("a closed socket is removed")
  void given_closed_should_remove() throws Exception {
    handler.afterConnectionEstablished(session);

    handler.afterConnectionClosed(session, CloseStatus.GOING_AWAY);

    assertThat(registry.get("socket-1")).isEmpty();
  }

  @Test
  @DisplayName("entity topics over the per-socket cap are denied, not checked")
  void given_tooManyEntityTopics_should_denyTheRest() throws Exception {
    // Arrange: the authorizer grants whatever it is asked
    handler.afterConnectionEstablished(session);
    when(authorizer.allowedTopics(eq(USER_ID), eq(TENANT_ID), anyCollection()))
        .thenAnswer(invocation -> Set.copyOf(invocation.<Collection<StreamTopic>>getArgument(2)));
    List<String> topics = new ArrayList<>();
    topics.add("list:atomic-testings");
    for (int i = 0; i <= StreamWebSocketHandler.MAX_ENTITY_TOPICS; i++) {
      topics.add(String.format("atomic-testing:3f2504e0-4f89-11d3-9a0c-%012d", i));
    }

    // Act
    subscribe(
        topics.stream().map(topic -> "\"" + topic + "\"").toList().toString().replace(" ", ""));

    // Assert
    assertThatJson(sent().getLast())
        .inPath("granted")
        .isArray()
        .hasSize(StreamWebSocketHandler.MAX_ENTITY_TOPICS + 1);
    assertThatJson(sent().getLast()).inPath("denied").isArray().containsExactly(topics.getLast());
    assertThat(registry.hasSubscribers(TENANT_ID, StreamTopic.LIST_ATOMIC_TESTINGS)).isTrue();
  }
}
