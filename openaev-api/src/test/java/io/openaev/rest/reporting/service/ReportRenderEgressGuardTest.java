package io.openaev.rest.reporting.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.microsoft.playwright.Request;
import com.microsoft.playwright.Route;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

@DisplayName("Report render egress guard (SSRF guard at the real fetch boundary)")
class ReportRenderEgressGuardTest {

  private static final String RENDER_TOKEN = "Bearer secret-render-token";

  // Loopback default: no custom render-base-url, plain HTTP on port 8080.
  private final ReportRenderEgressGuard loopbackGuard =
      new ReportRenderEgressGuard("", 8080, false);

  // Custom render-base-url: on-premise deployments pointing the renderer at another origin.
  private final ReportRenderEgressGuard customOriginGuard =
      new ReportRenderEgressGuard("https://render.internal:9443/app", 8080, false);

  @Test
  void allows_the_trusted_loopback_origin() {
    assertTrue(loopbackGuard.isAllowed("http://localhost:8080/reporting/abc/render?format=pdf"));
    assertTrue(loopbackGuard.isAllowed("http://localhost:8080/api/reportings/abc"));
  }

  @Test
  void denies_loopback_on_a_different_port_than_the_trusted_origin() {
    assertFalse(loopbackGuard.isAllowed("http://localhost:9999/evil"));
  }

  @Test
  void denies_loopback_on_a_different_scheme_than_the_trusted_origin() {
    assertFalse(loopbackGuard.isAllowed("https://localhost:8080/evil"));
  }

  @Test
  void allows_the_trusted_custom_origin() {
    assertTrue(customOriginGuard.isAllowed("https://render.internal:9443/reporting/abc/render"));
  }

  @Test
  void denies_a_private_target_that_is_not_the_trusted_origin() {
    assertFalse(customOriginGuard.isAllowed("http://127.0.0.1/hook"));
    assertFalse(customOriginGuard.isAllowed("http://10.0.0.5/hook"));
    assertFalse(customOriginGuard.isAllowed("http://169.254.169.254/latest/meta-data"));
  }

  @Test
  void allows_a_public_target() {
    assertTrue(customOriginGuard.isAllowed("https://8.8.8.8/logo.png"));
  }

  @Test
  void denies_an_unresolvable_host() {
    // Unlike config-save-time validators, the render browser fails closed here: it has no
    // legitimate reason to reach anything beyond its own trusted origin and verified public hosts.
    assertFalse(customOriginGuard.isAllowed("https://no-such-host.invalid/logo.png"));
  }

  @Test
  void allows_non_network_schemes() {
    assertTrue(customOriginGuard.isAllowed("data:image/png;base64,aGVsbG8="));
    assertTrue(customOriginGuard.isAllowed("about:blank"));
  }

  @Test
  void denies_a_malformed_url() {
    assertFalse(customOriginGuard.isAllowed("not a url"));
  }

  @Test
  void classifies_the_trusted_origin_separately_from_a_public_host() {
    assertEquals(
        ReportRenderEgressGuard.Verdict.TRUSTED,
        customOriginGuard.classify("https://render.internal:9443/reporting/abc/render"));
    assertEquals(
        ReportRenderEgressGuard.Verdict.PUBLIC,
        customOriginGuard.classify("https://8.8.8.8/logo.png"));
    assertEquals(
        ReportRenderEgressGuard.Verdict.BLOCKED,
        customOriginGuard.classify("http://127.0.0.1/hook"));
  }

  @Test
  void attaches_the_render_token_to_a_request_to_the_trusted_origin() {
    Route route = mock(Route.class);
    Request request = mock(Request.class);
    when(route.request()).thenReturn(request);
    when(request.url()).thenReturn("https://render.internal:9443/reporting/abc/render");
    when(request.headers()).thenReturn(Map.of("accept", "text/html"));

    customOriginGuard.handle(route, RENDER_TOKEN);

    ArgumentCaptor<Route.ResumeOptions> captor = ArgumentCaptor.forClass(Route.ResumeOptions.class);
    verify(route).resume(captor.capture());
    Map<String, String> forwardedHeaders = captor.getValue().headers;
    assertEquals(RENDER_TOKEN, forwardedHeaders.get("authorization"));
    assertEquals("text/html", forwardedHeaders.get("accept"));
  }

  @Test
  void replaces_an_authorization_header_the_page_set_itself_on_the_trusted_origin() {
    Route route = mock(Route.class);
    Request request = mock(Request.class);
    when(route.request()).thenReturn(request);
    when(request.url()).thenReturn("https://render.internal:9443/api/reportings/abc");
    when(request.headers()).thenReturn(Map.of("Authorization", "Bearer something-else"));

    customOriginGuard.handle(route, RENDER_TOKEN);

    ArgumentCaptor<Route.ResumeOptions> captor = ArgumentCaptor.forClass(Route.ResumeOptions.class);
    verify(route).resume(captor.capture());
    Map<String, String> forwardedHeaders = captor.getValue().headers;
    assertEquals(1, forwardedHeaders.size());
    assertEquals(RENDER_TOKEN, forwardedHeaders.get("authorization"));
  }

  @Test
  void resumes_the_trusted_origin_untouched_when_there_is_no_token_to_attach() {
    Route route = mock(Route.class);
    Request request = mock(Request.class);
    when(route.request()).thenReturn(request);
    when(request.url()).thenReturn("https://render.internal:9443/reporting/abc/render");

    customOriginGuard.handle(route, null);

    verify(route).resume();
    verify(route, never()).resume(any(Route.ResumeOptions.class));
  }

  @Test
  void never_attaches_the_render_token_to_a_public_host() {
    Route route = mock(Route.class);
    Request request = mock(Request.class);
    when(route.request()).thenReturn(request);
    when(request.url()).thenReturn("https://8.8.8.8/logo.png");

    customOriginGuard.handle(route, RENDER_TOKEN);

    verify(route).resume();
    verify(route, never()).resume(any(Route.ResumeOptions.class));
  }

  @Test
  void aborts_a_blocked_target_without_sending_any_request() {
    Route route = mock(Route.class);
    Request request = mock(Request.class);
    when(route.request()).thenReturn(request);
    when(request.url()).thenReturn("http://127.0.0.1/hook");

    customOriginGuard.handle(route, RENDER_TOKEN);

    verify(route).abort("blockedbyclient");
    verify(route, never()).resume();
    verify(route, never()).resume(any(Route.ResumeOptions.class));
  }
}
