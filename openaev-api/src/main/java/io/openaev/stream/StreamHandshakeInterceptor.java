package io.openaev.stream;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

import io.openaev.config.OpenAEVPrincipal;
import io.openaev.config.TenantUriUtils;
import io.openaev.config.cache.TenantMembershipCacheManager;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

/**
 * Admits a WebSocket handshake only for a browser session that belongs to the tenant of the URL.
 *
 * <p>It runs after the security filter chain (so {@code /api/**} is already authenticated) and
 * after Spring's origin check, but MVC interceptors do not run for a handshake, so the membership
 * check of {@code TenantInterceptor} is repeated here. Refused:
 *
 * <ul>
 *   <li>a request without an {@code Origin} header, which Spring's origin check would otherwise let
 *       through as same-origin;
 *   <li>a request with an {@code Authorization} header: API tokens may not open a socket;
 *   <li>a request without an existing HTTP session, or whose authentication is not the one stored
 *       in that session (e.g. an API token cookie): the socket is bound to a browser session, which
 *       the heartbeat checks again. A session is never created here;
 *   <li>a user who is not a member of the tenant.
 * </ul>
 *
 * The user id, tenant id and HTTP session id are stored on the socket. The session id stays on the
 * server and is never logged.
 */
@Slf4j
public class StreamHandshakeInterceptor implements HandshakeInterceptor {

  static final String ATTR_USER_ID = "openaev.stream.userId";
  static final String ATTR_TENANT_ID = "openaev.stream.tenantId";
  static final String ATTR_HTTP_SESSION_ID = "openaev.stream.httpSessionId";

  static final String REASON_NOT_SERVLET = "not-servlet";
  static final String REASON_NO_ORIGIN = "no-origin";
  static final String REASON_API_TOKEN = "api-token";
  static final String REASON_NO_SESSION = "no-session";
  static final String REASON_NOT_SESSION_AUTH = "not-session-auth";
  static final String REASON_NO_TENANT = "no-tenant";
  static final String REASON_NOT_MEMBER = "not-member";

  private final TenantUriUtils tenantUriUtils;
  private final TenantMembershipCacheManager tenantMembershipCacheManager;
  private final StreamMetrics metrics;

  public StreamHandshakeInterceptor(
      TenantUriUtils tenantUriUtils,
      TenantMembershipCacheManager tenantMembershipCacheManager,
      StreamMetrics metrics) {
    this.tenantUriUtils = tenantUriUtils;
    this.tenantMembershipCacheManager = tenantMembershipCacheManager;
    this.metrics = metrics;
  }

  @Override
  public boolean beforeHandshake(
      ServerHttpRequest request,
      ServerHttpResponse response,
      WebSocketHandler wsHandler,
      Map<String, Object> attributes) {
    if (!(request instanceof ServletServerHttpRequest servletRequest)) {
      return refuse(response, HttpStatus.FORBIDDEN, REASON_NOT_SERVLET);
    }
    HttpServletRequest http = servletRequest.getServletRequest();
    if (!StringUtils.hasText(http.getHeader(HttpHeaders.ORIGIN))) {
      return refuse(response, HttpStatus.FORBIDDEN, REASON_NO_ORIGIN);
    }
    if (http.getHeader(HttpHeaders.AUTHORIZATION) != null) {
      return refuse(response, HttpStatus.FORBIDDEN, REASON_API_TOKEN);
    }
    HttpSession session = http.getSession(false);
    if (session == null) {
      return refuse(response, HttpStatus.UNAUTHORIZED, REASON_NO_SESSION);
    }
    Optional<String> userId = sessionUserId(session);
    if (userId.isEmpty() || !userId.equals(currentUserId())) {
      return refuse(response, HttpStatus.UNAUTHORIZED, REASON_NOT_SESSION_AUTH);
    }
    Optional<String> tenantId = tenantUriUtils.getTenantIdFromRequestUrl(http);
    if (tenantId.isEmpty()) {
      return refuse(response, HttpStatus.FORBIDDEN, REASON_NO_TENANT);
    }
    if (!tenantMembershipCacheManager.existsByUserIdAndTenantId(userId.get(), tenantId.get())) {
      return refuse(response, HttpStatus.FORBIDDEN, REASON_NOT_MEMBER);
    }
    attributes.put(ATTR_USER_ID, userId.get());
    attributes.put(ATTR_TENANT_ID, tenantId.get());
    attributes.put(ATTR_HTTP_SESSION_ID, session.getId());
    return true;
  }

  @Override
  public void afterHandshake(
      ServerHttpRequest request,
      ServerHttpResponse response,
      WebSocketHandler wsHandler,
      Exception exception) {
    // nothing to do after the upgrade
  }

  private static Optional<String> currentUserId() {
    return principalId(SecurityContextHolder.getContext().getAuthentication());
  }

  private static Optional<String> sessionUserId(HttpSession session) {
    if (session.getAttribute(SPRING_SECURITY_CONTEXT_KEY) instanceof SecurityContext context) {
      return principalId(context.getAuthentication());
    }
    return Optional.empty();
  }

  private static Optional<String> principalId(Authentication authentication) {
    if (authentication != null
        && authentication.isAuthenticated()
        && authentication.getPrincipal() instanceof OpenAEVPrincipal principal) {
      return Optional.ofNullable(principal.getId());
    }
    return Optional.empty();
  }

  private boolean refuse(ServerHttpResponse response, HttpStatus status, String reason) {
    metrics.handshakeRefused(reason);
    log.debug("Stream handshake refused: {}", reason);
    response.setStatusCode(status);
    return false;
  }
}
