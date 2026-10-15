package io.openaev.rest.reporting.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.LoadState;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Runs {@link ReportRenderEgressGuard} against a real headless Chromium, because the guard's whole
 * point is what actually goes out on the wire: a mocked {@code Route} cannot tell whether the
 * render token really stays off the requests to a tenant-controlled host, nor whether the browser
 * still connects to anything by itself.
 *
 * <p>Three local servers stand for the three kinds of target. The trusted origin is {@code
 * localhost:<port>}. The "public" host is {@code public.test}: it resolves to nothing for Chromium
 * (which must therefore never try to reach it itself) and, for the guard's fetch, to the public
 * server. The internal target is a loopback literal that must never be contacted.
 */
@DisplayName("Report render egress guard on a real Chromium (what really goes out on the wire)")
class ReportRenderEgressGuardBrowserTest {

  private static final String RENDER_TOKEN = "Bearer secret-render-token";

  private RecordingServer trusted;
  private RecordingServer publicHost;
  private RecordingServer internal;
  private ExternalResourceFetcher fetcher;
  private ReportRenderEgressGuard guard;

  // Launching Chromium is the slow part: once for the class, a fresh context for each test.
  private static Playwright playwright;
  private static Browser browser;

  @BeforeAll
  static void launchBrowser() {
    playwright = Playwright.create();
    browser = playwright.chromium().launch();
  }

  @AfterAll
  static void closeBrowser() {
    browser.close();
    playwright.close();
  }

  @BeforeEach
  void setUp() throws IOException {
    this.internal = new RecordingServer();
    this.publicHost = new RecordingServer();
    this.publicHost.on(
        "/redirect-to-internal",
        redirectTo("http://127.0.0.1:" + this.internal.port() + "/internal.png"));
    this.trusted = new RecordingServer();
    this.trusted.on(
        "/render",
        page(
            "<html><body>"
                + "<img src='http://public.test:"
                + this.publicHost.port()
                + "/logo.png'>"
                + "<img src='http://public.test:"
                + this.publicHost.port()
                + "/redirect-to-internal'>"
                + "<img src='http://127.0.0.1:"
                + this.internal.port()
                + "/internal.png'>"
                + "</body></html>"));

    this.fetcher =
        new ExternalResourceFetcher(new LoopbackAsPublicDnsResolver("public.test"), 1024);
    this.guard =
        new ReportRenderEgressGuard(
            "http://localhost:" + this.trusted.port(), 8080, false, this.fetcher);
  }

  @AfterEach
  void tearDown() throws IOException {
    this.fetcher.close();
    this.trusted.stop();
    this.publicHost.stop();
    this.internal.stop();
  }

  @Test
  void the_render_token_reaches_the_trusted_origin_and_nobody_else() {
    renderTrustedPage();

    List<String> trustedHeaders = this.trusted.authorizationHeaders();
    assertTrue(trustedHeaders.size() >= 2, "page load and same-origin API call");
    assertTrue(
        trustedHeaders.stream().allMatch(RENDER_TOKEN::equals),
        "every request to the trusted origin carries the render token");
    List<String> externalHeaders = this.publicHost.authorizationHeaders();
    assertFalse(externalHeaders.isEmpty(), "the external host is fetched");
    assertTrue(
        externalHeaders.stream().allMatch(Objects::isNull),
        "but never receives any Authorization header");
  }

  @Test
  void an_external_resource_is_fetched_for_the_browser_which_never_resolves_the_host_itself() {
    renderTrustedPage();

    // public.test resolves to nothing for Chromium: that the image request reached the public
    // server at all means the guard fetched it, not the browser.
    assertTrue(
        this.publicHost.paths().contains("/logo.png"),
        "the guard fetched the logo on the browser's behalf");
  }

  @Test
  void an_internal_target_is_never_contacted() {
    renderTrustedPage();

    assertTrue(
        this.internal.paths().isEmpty(),
        "neither a direct reference nor a redirect from a public host reaches the internal target,"
            + " but it received: "
            + this.internal.paths());
  }

  @Test
  void a_redirect_from_a_public_host_to_an_internal_target_is_refused() {
    renderTrustedPage();

    // The public host did answer with a redirect, which the guard's fetch followed itself and
    // refused at the internal hop. Handed back to Chromium instead, the redirect would have been
    // followed by the browser straight to the internal target, unchecked.
    assertTrue(this.publicHost.paths().contains("/redirect-to-internal"));
    assertTrue(
        this.internal.paths().isEmpty(),
        "the internal hop must never be contacted, but it received: " + this.internal.paths());
  }

  private void renderTrustedPage() {
    try (BrowserContext context = browser.newContext()) {
      this.guard.install(context, RENDER_TOKEN);
      Page page = context.newPage();
      page.navigate("http://localhost:" + this.trusted.port() + "/render");
      page.waitForLoadState(LoadState.NETWORKIDLE);
      // A same-origin call, like the SPA's own API calls, must be authenticated too.
      page.evaluate("() => fetch('/api/ping').then(r => r.status)");
    }
  }

  private static HttpHandler page(final String html) {
    return exchange -> {
      byte[] body = html.getBytes(StandardCharsets.UTF_8);
      exchange.getResponseHeaders().add("Content-Type", "text/html; charset=utf-8");
      exchange.sendResponseHeaders(200, body.length);
      exchange.getResponseBody().write(body);
    };
  }

  private static HttpHandler redirectTo(final String location) {
    return exchange -> {
      exchange.getResponseHeaders().add("Location", location);
      exchange.sendResponseHeaders(302, -1);
    };
  }

  /** Tiny HTTP server that records the path and Authorization header of every request. */
  private static final class RecordingServer {
    private final HttpServer server;
    private final List<String> paths = Collections.synchronizedList(new ArrayList<>());
    private final List<String> authorizationHeaders =
        Collections.synchronizedList(new ArrayList<>());

    RecordingServer() throws IOException {
      this.server = HttpServer.create(new InetSocketAddress(0), 0);
      // Anything not routed explicitly: an image (for the logo) or an empty answer (for the api).
      on(
          "/",
          exchange -> {
            exchange.getResponseHeaders().add("Content-Type", "image/png");
            exchange.sendResponseHeaders(200, -1);
          });
      this.server.start();
    }

    void on(final String path, final HttpHandler handler) {
      this.server.createContext(
          path,
          exchange -> {
            this.paths.add(exchange.getRequestURI().getPath());
            this.authorizationHeaders.add(exchange.getRequestHeaders().getFirst("Authorization"));
            handler.handle(exchange);
            exchange.close();
          });
    }

    int port() {
      return this.server.getAddress().getPort();
    }

    List<String> paths() {
      synchronized (this.paths) {
        return new ArrayList<>(this.paths);
      }
    }

    List<String> authorizationHeaders() {
      synchronized (this.authorizationHeaders) {
        return new ArrayList<>(this.authorizationHeaders);
      }
    }

    void stop() {
      this.server.stop(0);
    }
  }
}
