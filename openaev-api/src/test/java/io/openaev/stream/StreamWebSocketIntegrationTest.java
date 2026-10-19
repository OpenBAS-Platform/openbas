package io.openaev.stream;

import static io.openaev.rest.scenario.ScenarioApi.TENANT_SCENARIO_URI;
import static io.openaev.service.UserService.buildAuthenticationToken;
import static io.openaev.utils.JsonTestUtils.asJsonString;
import static net.javacrumbs.jsonunit.assertj.JsonAssertions.assertThatJson;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import io.openaev.IntegrationTest;
import io.openaev.config.TenantUriUtils;
import io.openaev.database.model.Capability;
import io.openaev.database.model.Tenant;
import io.openaev.database.model.User;
import io.openaev.database.repository.ScenarioRepository;
import io.openaev.rest.scenario.form.ScenarioInput;
import io.openaev.utils.fixtures.TenantGroupFixture;
import io.openaev.utils.fixtures.TenantRoleFixture;
import io.openaev.utils.fixtures.UserFixture;
import io.openaev.utils.fixtures.composers.TenantGroupComposer;
import io.openaev.utils.fixtures.composers.TenantRoleComposer;
import io.openaev.utils.fixtures.composers.UserComposer;
import io.openaev.utils.helpers.SessionTestHelper;
import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import javax.sql.DataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.session.SessionRepository;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * The stream end to end, over a real socket on the random port: handshake refusals, subscribe,
 * invalidation of a scenario created through the API, protocol limits and heartbeat revocation.
 *
 * <p>Deliberately NOT {@code @Transactional}: the invalidation fires after a real commit and the
 * stream opens its own {@code TenantScopedTransaction}. Fixtures are committed and removed by hand.
 * The heartbeat is shortened so revocation is observable in a few seconds.
 */
@TestPropertySource(properties = "openaev.stream.heartbeat-interval=1s")
@DisplayName("Stream WebSocket: end to end")
class StreamWebSocketIntegrationTest extends IntegrationTest {

  private static final String ALLOWED_ORIGIN = "http://localhost:8080";
  private static final Duration WAIT = Duration.ofSeconds(10);

  @LocalServerPort private int port;
  @Autowired private MockMvc mvc;
  @Autowired private UserComposer userComposer;
  @Autowired private TenantGroupComposer tenantGroupComposer;
  @Autowired private TenantRoleComposer tenantRoleComposer;
  @Autowired private SessionTestHelper sessionTestHelper;
  @Autowired private SessionRepository<? extends Session> sessionRepository;
  @Autowired private ScenarioRepository scenarioRepository;
  @Autowired private PlatformTransactionManager transactionManager;
  @Autowired private DataSource dataSource;

  private final String tenantT = Tenant.DEFAULT_TENANT_UUID;
  private String tenantU;
  private JdbcTemplate jdbc;
  private TransactionTemplate tx;
  private final List<UserComposer.Composer> createdUsers = new ArrayList<>();
  private final List<String> createdSessions = new ArrayList<>();
  private final List<String> createdScenarios = new ArrayList<>();
  private final List<WebSocketSession> openSockets = new ArrayList<>();

  @BeforeEach
  void seedSecondTenant() {
    jdbc = new JdbcTemplate(dataSource);
    tx = new TransactionTemplate(transactionManager);
    tenantU = UUID.randomUUID().toString();
    jdbc.update(
        "INSERT INTO tenants (tenant_id, tenant_name, tenant_created_at, tenant_updated_at)"
            + " VALUES (?, ?, now(), now())",
        tenantU,
        "stream-u-" + tenantU);
  }

  @AfterEach
  void cleanup() {
    openSockets.forEach(
        socket -> {
          try {
            socket.close();
          } catch (Exception e) {
            // already closed by the server
          }
        });
    openSockets.clear();
    createdScenarios.forEach(
        id -> tx.executeWithoutResult(status -> scenarioRepository.deleteById(id)));
    createdScenarios.clear();
    createdSessions.forEach(this::deleteSession);
    createdSessions.clear();
    createdUsers.forEach(
        composer ->
            tx.executeWithoutResult(
                status -> {
                  jdbc.update(
                      "DELETE FROM users_tenants WHERE user_id = ?", composer.get().getId());
                  composer.delete();
                }));
    createdUsers.clear();
    userComposer.reset();
    tenantGroupComposer.reset();
    tenantRoleComposer.reset();
    jdbc.update("DELETE FROM tenants WHERE tenant_id = ?", tenantU);
  }

  // -- FIXTURES --

  /**
   * A committed user, member of {@code tenantId}, with a group of tenant T holding capabilities.
   */
  private User user(boolean admin, Set<Capability> capabilities, String tenantId) {
    User user =
        tx.execute(
            status -> {
              User created =
                  UserFixture.getUser(
                      "Stream",
                      "User",
                      "stream-" + UUID.randomUUID() + "@unittests.invalid",
                      admin);
              UserComposer.Composer composer = userComposer.forUser(created);
              if (!capabilities.isEmpty()) {
                composer.withGroup(
                    tenantGroupComposer
                        .forGroup(TenantGroupFixture.getGroup("stream-" + UUID.randomUUID()))
                        .withRole(
                            tenantRoleComposer.forRole(
                                TenantRoleFixture.getRole(
                                    "stream-" + UUID.randomUUID(), capabilities))));
              }
              composer.persist();
              createdUsers.add(composer);
              tenantRepository.addUserToTenant(created.getId(), tenantId);
              return created;
            });
    tenantMembershipCacheManager.evict(user.getId(), tenantId);
    return user;
  }

  /** A committed Spring Session authenticated as {@code user}, as a browser login leaves it. */
  @SuppressWarnings("unchecked")
  private String browserSession(User user) {
    SessionRepository<Session> repository = (SessionRepository<Session>) sessionRepository;
    Session session = repository.createSession();
    session.setAttribute(
        SPRING_SECURITY_CONTEXT_KEY, new SecurityContextImpl(buildAuthenticationToken(user)));
    session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, user.getId());
    repository.save(session);
    createdSessions.add(session.getId());
    return session.getId();
  }

  private void deleteSession(String sessionId) {
    sessionRepository.deleteById(sessionId);
  }

  // -- CLIENT --

  /** Collects text frames and the close status of one client socket. */
  static final class Client extends TextWebSocketHandler {
    final BlockingQueue<String> messages = new LinkedBlockingQueue<>();
    final CompletableFuture<CloseStatus> closed = new CompletableFuture<>();

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
      messages.add(message.getPayload());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
      closed.complete(status);
    }

    /** The next message of {@code type}, skipping heartbeats; fails after {@link #WAIT}. */
    String next(String type) throws InterruptedException {
      long deadline = System.nanoTime() + WAIT.toNanos();
      while (System.nanoTime() < deadline) {
        String message = messages.poll(200, TimeUnit.MILLISECONDS);
        if (message != null && type.equals(JsonPath.read(message, "$.type"))) {
          return message;
        }
      }
      throw new AssertionError("no '" + type + "' message within " + WAIT);
    }

    /** Whether a message of {@code type} arrives within {@code window}. */
    boolean receives(String type, Duration window) throws InterruptedException {
      long deadline = System.nanoTime() + window.toNanos();
      while (System.nanoTime() < deadline) {
        String message = messages.poll(100, TimeUnit.MILLISECONDS);
        if (message != null && type.equals(JsonPath.read(message, "$.type"))) {
          return true;
        }
      }
      return false;
    }

    CloseStatus awaitClose() throws Exception {
      return closed.get(WAIT.toSeconds(), TimeUnit.SECONDS);
    }
  }

  private URI wsUri(String tenantId) {
    return URI.create(
        "ws://localhost:" + port + TenantUriUtils.TENANT_BASE_PATH + tenantId + "/ws");
  }

  private WebSocketHttpHeaders headers(String origin, String sessionId) {
    WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
    if (origin != null) {
      headers.add(HttpHeaders.ORIGIN, origin);
    }
    if (sessionId != null) {
      headers.add(
          HttpHeaders.COOKIE,
          sessionTestHelper.cookieFor(sessionId).getName()
              + "="
              + sessionTestHelper.cookieFor(sessionId).getValue());
    }
    return headers;
  }

  private Client connect(String tenantId, WebSocketHttpHeaders headers) throws Exception {
    Client client = new Client();
    WebSocketSession socket =
        new StandardWebSocketClient()
            .execute(client, headers, wsUri(tenantId))
            .get(WAIT.toSeconds(), TimeUnit.SECONDS);
    openSockets.add(socket);
    client.next(StreamMessages.TYPE_READY);
    return client;
  }

  private Client connectAs(User user, String tenantId) throws Exception {
    return connect(tenantId, headers(ALLOWED_ORIGIN, browserSession(user)));
  }

  private WebSocketSession socketOf(int index) {
    return openSockets.get(index);
  }

  private void subscribe(WebSocketSession socket, String... topics) throws Exception {
    String list = String.join(",", Arrays.stream(topics).map(t -> "\"" + t + "\"").toList());
    socket.sendMessage(new TextMessage("{\"type\":\"subscribe\",\"topics\":[" + list + "]}"));
  }

  private void assertRefused(String tenantId, WebSocketHttpHeaders headers) {
    assertThatThrownBy(
            () ->
                new StandardWebSocketClient()
                    .execute(new Client(), headers, wsUri(tenantId))
                    .get(WAIT.toSeconds(), TimeUnit.SECONDS))
        .isInstanceOf(ExecutionException.class);
  }

  // -- TESTS --

  @Nested
  @DisplayName("Handshake")
  class Handshake {

    @Test
    @DisplayName("another origin is refused")
    void given_otherOrigin_should_refuse() {
      User admin = user(true, Set.of(), tenantT);
      assertRefused(tenantT, headers("http://evil.example", browserSession(admin)));
    }

    @Test
    @DisplayName("no origin is refused")
    void given_noOrigin_should_refuse() {
      User admin = user(true, Set.of(), tenantT);
      assertRefused(tenantT, headers(null, browserSession(admin)));
    }

    @Test
    @DisplayName("no session is refused")
    void given_noSession_should_refuse() {
      assertRefused(tenantT, headers(ALLOWED_ORIGIN, null));
    }

    @Test
    @DisplayName("an API token is refused, even beside a valid session")
    void given_apiToken_should_refuse() {
      User admin = user(true, Set.of(), tenantT);
      WebSocketHttpHeaders headers = headers(ALLOWED_ORIGIN, browserSession(admin));
      headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + UUID.randomUUID());
      assertRefused(tenantT, headers);
    }

    @Test
    @DisplayName("a user who is not a member of the tenant is refused")
    void given_nonMember_should_refuse() {
      User outsider = user(true, Set.of(), tenantU);
      assertRefused(tenantT, headers(ALLOWED_ORIGIN, browserSession(outsider)));
    }

    @Test
    @DisplayName("an accepted handshake receives ready")
    void given_member_should_receiveReady() throws Exception {
      User admin = user(true, Set.of(), tenantT);
      Client client = new Client();
      new StandardWebSocketClient()
          .execute(client, headers(ALLOWED_ORIGIN, browserSession(admin)), wsUri(tenantT))
          .thenAccept(openSockets::add)
          .get(WAIT.toSeconds(), TimeUnit.SECONDS);

      assertThatJson(client.next(StreamMessages.TYPE_READY))
          .isEqualTo("{\"type\":\"ready\",\"protocol\":1}");
    }
  }

  @Nested
  @DisplayName("Subscribe")
  class Subscribe {

    @Test
    @DisplayName("an administrator and an ACCESS_ASSESSMENT holder are granted, others denied")
    void given_users_should_grantOrDenyByCapability() throws Exception {
      Client admin = connectAs(user(true, Set.of(), tenantT), tenantT);
      subscribe(socketOf(0), "list:scenarios", "list:unknown");
      assertThatJson(admin.next(StreamMessages.TYPE_SUBSCRIBED))
          .isEqualTo(
              "{\"type\":\"subscribed\",\"granted\":[\"list:scenarios\"],"
                  + "\"denied\":[\"list:unknown\"]}");

      Client viewer =
          connectAs(user(false, Set.of(Capability.ACCESS_ASSESSMENT), tenantT), tenantT);
      subscribe(socketOf(1), "list:scenarios");
      assertThatJson(viewer.next(StreamMessages.TYPE_SUBSCRIBED))
          .isEqualTo("{\"type\":\"subscribed\",\"granted\":[\"list:scenarios\"],\"denied\":[]}");

      Client other = connectAs(user(false, Set.of(Capability.ACCESS_ASSETS), tenantT), tenantT);
      subscribe(socketOf(2), "list:scenarios");
      assertThatJson(other.next(StreamMessages.TYPE_SUBSCRIBED))
          .isEqualTo("{\"type\":\"subscribed\",\"granted\":[],\"denied\":[\"list:scenarios\"]}");
    }
  }

  @Nested
  @DisplayName("Invalidation")
  class Invalidation {

    @Test
    @DisplayName(
        "a scenario created through the API invalidates subscribed sockets of its tenant only")
    void given_scenarioCreated_should_invalidateOwnTenantSubscribersOnly() throws Exception {
      // Arrange
      User alice = user(true, Set.of(), tenantT);
      Client subscribed =
          connectAs(user(false, Set.of(Capability.ACCESS_ASSESSMENT), tenantT), tenantT);
      subscribe(socketOf(0), "list:scenarios");
      subscribed.next(StreamMessages.TYPE_SUBSCRIBED);
      Client unsubscribed = connectAs(user(true, Set.of(), tenantT), tenantT);
      Client otherTenant = connectAs(user(true, Set.of(), tenantU), tenantU);
      subscribe(socketOf(2), "list:scenarios");
      otherTenant.next(StreamMessages.TYPE_SUBSCRIBED);

      // Act
      ScenarioInput input = new ScenarioInput();
      input.setName("stream scenario " + UUID.randomUUID());
      String response =
          mvc.perform(
                  post(TENANT_SCENARIO_URI.replace("{tenantId}", tenantT))
                      .content(asJsonString(input))
                      .contentType(MediaType.APPLICATION_JSON)
                      .with(authentication(buildAuthenticationToken(alice)))
                      .with(csrf()))
              .andExpect(status().is2xxSuccessful())
              .andReturn()
              .getResponse()
              .getContentAsString();
      createdScenarios.add(JsonPath.read(response, "$.scenario_id"));

      // Assert
      assertThatJson(subscribed.next(StreamMessages.TYPE_INVALIDATE))
          .isEqualTo("{\"type\":\"invalidate\",\"topic\":\"list:scenarios\"}");
      assertThat(otherTenant.receives(StreamMessages.TYPE_INVALIDATE, Duration.ofSeconds(3)))
          .isFalse();
      assertThat(unsubscribed.receives(StreamMessages.TYPE_INVALIDATE, Duration.ofMillis(500)))
          .isFalse();
    }
  }

  @Nested
  @DisplayName("Limits")
  class Limits {

    @Test
    @DisplayName("a message over 16 KB closes the socket with 1009")
    void given_tooBigMessage_should_closeWith1009() throws Exception {
      Client client = connectAs(user(true, Set.of(), tenantT), tenantT);

      socketOf(0).sendMessage(new TextMessage("x".repeat(17 * 1024)));

      assertThat(client.awaitClose().getCode()).isEqualTo(1009);
    }

    @Test
    @DisplayName("an eleventh subscribe within 10 s closes the socket with 1008")
    void given_eleventhSubscribe_should_closeWith1008() throws Exception {
      Client client = connectAs(user(true, Set.of(), tenantT), tenantT);

      for (int i = 0; i < 11; i++) {
        subscribe(socketOf(0));
      }

      assertThat(client.awaitClose().getCode()).isEqualTo(1008);
    }

    @Test
    @DisplayName("a malformed message closes the socket with 1008")
    void given_malformedMessage_should_closeWith1008() throws Exception {
      Client client = connectAs(user(true, Set.of(), tenantT), tenantT);

      socketOf(0).sendMessage(new TextMessage("{\"type\":\"delete\",\"id\":\"x\"}"));

      assertThat(client.awaitClose().getCode()).isEqualTo(1008);
    }
  }

  @Nested
  @DisplayName("Heartbeat")
  class Heartbeat {

    @Test
    @DisplayName("a deleted session closes the socket with 4401")
    void given_deletedSession_should_closeWith4401() throws Exception {
      User bob = user(true, Set.of(), tenantT);
      String sessionId = browserSession(bob);
      Client client = connect(tenantT, headers(ALLOWED_ORIGIN, sessionId));

      deleteSession(sessionId);

      assertThat(client.awaitClose().getCode()).isEqualTo(4401);
    }

    @Test
    @DisplayName("a removed membership closes the socket with 4403")
    void given_removedMembership_should_closeWith4403() throws Exception {
      User bob = user(true, Set.of(), tenantT);
      Client client = connectAs(bob, tenantT);

      tx.executeWithoutResult(
          status -> tenantRepository.removeUserFromTenant(bob.getId(), tenantT));
      tenantMembershipCacheManager.evict(bob.getId(), tenantT);

      assertThat(client.awaitClose().getCode()).isEqualTo(4403);
    }

    @Test
    @DisplayName("a removed capability brings subscription-revoked")
    void given_removedCapability_should_revokeTopic() throws Exception {
      User bob = user(false, Set.of(Capability.ACCESS_ASSESSMENT), tenantT);
      Client client = connectAs(bob, tenantT);
      subscribe(socketOf(0), "list:scenarios");
      client.next(StreamMessages.TYPE_SUBSCRIBED);

      jdbc.update("DELETE FROM users_groups WHERE user_id = ?", bob.getId());

      assertThatJson(client.next(StreamMessages.TYPE_SUBSCRIPTION_REVOKED))
          .isEqualTo("{\"type\":\"subscription-revoked\",\"topics\":[\"list:scenarios\"]}");
    }
  }
}
