package io.openaev.stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.openaev.config.DefaultOpenAEVPrincipal;
import io.openaev.config.TenantUriUtils;
import io.openaev.config.cache.TenantMembershipCacheManager;
import io.openaev.utils.RequestUtils;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.socket.WebSocketHandler;

@DisplayName("StreamHandshakeInterceptor: who may open a socket")
class StreamHandshakeInterceptorTest {

  private static final String TENANT_ID = UUID.randomUUID().toString();
  private static final String USER_ID = "user-a";
  private static final String ORIGIN = "http://localhost:8080";

  private TenantMembershipCacheManager membership;
  private SimpleMeterRegistry meterRegistry;
  private StreamHandshakeInterceptor interceptor;
  private MockHttpServletResponse servletResponse;
  private Map<String, Object> attributes;

  @BeforeEach
  void setUp() {
    membership = mock(TenantMembershipCacheManager.class);
    when(membership.existsByUserIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(true);
    meterRegistry = new SimpleMeterRegistry();
    interceptor =
        new StreamHandshakeInterceptor(
            new TenantUriUtils(new RequestUtils()), membership, new StreamMetrics(meterRegistry));
    servletResponse = new MockHttpServletResponse();
    attributes = new HashMap<>();
    SecurityContextHolder.getContext().setAuthentication(authentication(USER_ID));
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  private static Authentication authentication(String userId) {
    return new PreAuthenticatedAuthenticationToken(
        new DefaultOpenAEVPrincipal(userId, List.of(), false, "en"), "", List.of());
  }

  private static MockHttpSession sessionOf(String userId) {
    MockHttpSession session = new MockHttpSession();
    session.setAttribute(
        SPRING_SECURITY_CONTEXT_KEY, new SecurityContextImpl(authentication(userId)));
    return session;
  }

  private static MockHttpServletRequest browserRequest() {
    MockHttpServletRequest request =
        new MockHttpServletRequest("GET", "/api/tenants/" + TENANT_ID + "/ws");
    request.addHeader(HttpHeaders.ORIGIN, ORIGIN);
    request.setSession(sessionOf(USER_ID));
    return request;
  }

  private boolean handshake(MockHttpServletRequest request) {
    servletResponse = new MockHttpServletResponse();
    ServletServerHttpResponse response = new ServletServerHttpResponse(servletResponse);
    return interceptor.beforeHandshake(
        new ServletServerHttpRequest(request), response, mock(WebSocketHandler.class), attributes);
  }

  private double refused(String reason) {
    return meterRegistry
        .get("openaev.stream.ws.handshakes.refused")
        .tag("reason", reason)
        .counter()
        .count();
  }

  @Test
  @DisplayName("a browser session member of the tenant is accepted and bound to the socket")
  void given_memberBrowserSession_should_accept() {
    MockHttpServletRequest request = browserRequest();

    assertThat(handshake(request)).isTrue();
    assertThat(attributes)
        .containsEntry(StreamHandshakeInterceptor.ATTR_USER_ID, USER_ID)
        .containsEntry(StreamHandshakeInterceptor.ATTR_TENANT_ID, TENANT_ID)
        .containsEntry(
            StreamHandshakeInterceptor.ATTR_HTTP_SESSION_ID, request.getSession().getId());
  }

  @Test
  @DisplayName("no Origin header is refused")
  void given_noOrigin_should_refuse() {
    MockHttpServletRequest request = browserRequest();
    request.removeHeader(HttpHeaders.ORIGIN);

    assertThat(handshake(request)).isFalse();
    assertThat(servletResponse.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
    assertThat(refused(StreamHandshakeInterceptor.REASON_NO_ORIGIN)).isEqualTo(1);
  }

  @Test
  @DisplayName("an Authorization header (API token) is refused")
  void given_authorizationHeader_should_refuse() {
    MockHttpServletRequest request = browserRequest();
    request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer token");

    assertThat(handshake(request)).isFalse();
    assertThat(servletResponse.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
    assertThat(refused(StreamHandshakeInterceptor.REASON_API_TOKEN)).isEqualTo(1);
  }

  @Test
  @DisplayName("no existing session is refused and none is created")
  void given_noSession_should_refuseWithoutCreatingOne() {
    MockHttpServletRequest request =
        new MockHttpServletRequest("GET", "/api/tenants/" + TENANT_ID + "/ws");
    request.addHeader(HttpHeaders.ORIGIN, ORIGIN);

    assertThat(handshake(request)).isFalse();
    assertThat(servletResponse.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
    assertThat(request.getSession(false)).isNull();
    assertThat(refused(StreamHandshakeInterceptor.REASON_NO_SESSION)).isEqualTo(1);
  }

  @Test
  @DisplayName("an authentication that is not the session's (e.g. a token cookie) is refused")
  void given_authenticationNotFromSession_should_refuse() {
    MockHttpServletRequest request = browserRequest();
    request.setSession(sessionOf("someone-else"));

    assertThat(handshake(request)).isFalse();
    assertThat(servletResponse.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
    assertThat(refused(StreamHandshakeInterceptor.REASON_NOT_SESSION_AUTH)).isEqualTo(1);
  }

  @Test
  @DisplayName("a session without a security context is refused")
  void given_anonymousSession_should_refuse() {
    MockHttpServletRequest request = browserRequest();
    request.setSession(new MockHttpSession());

    assertThat(handshake(request)).isFalse();
    assertThat(refused(StreamHandshakeInterceptor.REASON_NOT_SESSION_AUTH)).isEqualTo(1);
  }

  @Test
  @DisplayName("a user who is not a member of the tenant is refused")
  void given_nonMember_should_refuse() {
    when(membership.existsByUserIdAndTenantId(USER_ID, TENANT_ID)).thenReturn(false);

    assertThat(handshake(browserRequest())).isFalse();
    assertThat(servletResponse.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
    assertThat(refused(StreamHandshakeInterceptor.REASON_NOT_MEMBER)).isEqualTo(1);
    assertThat(attributes).isEmpty();
  }

  @Test
  @DisplayName("a URL without a tenant is refused")
  void given_noTenant_should_refuse() {
    MockHttpServletRequest request = browserRequest();
    request.setRequestURI("/api/ws");

    assertThat(handshake(request)).isFalse();
    assertThat(refused(StreamHandshakeInterceptor.REASON_NO_TENANT)).isEqualTo(1);
  }
}
