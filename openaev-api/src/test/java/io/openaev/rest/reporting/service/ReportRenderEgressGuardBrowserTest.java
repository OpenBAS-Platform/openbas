package io.openaev.rest.reporting.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.LoadState;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Runs {@link ReportRenderEgressGuard} against a real headless Chromium, because the guard's whole
 * point is what actually goes out on the wire: a mocked {@code Route} cannot tell whether the
 * render token really stays off the requests to a tenant-controlled host.
 *
 * <p>Three local servers stand for the three kinds of target. The trusted origin is {@code
 * localhost:<port>}. The "public" host is {@code public.test}: the guard is told it resolves to a
 * public address, while Chromium is told (host-resolver-rules) to reach it on the loopback server.
 * The internal target is a loopback literal that the guard must refuse to let Chromium contact.
 */
@DisplayName("Report render egress guard on a real Chromium (what really goes out on the wire)")
class ReportRenderEgressGuardBrowserTest {

  private static final String RENDER_TOKEN = "Bearer secret-render-token";

  private RecordingServer trusted;
  private RecordingServer publicHost;
  private RecordingServer internal;
  private Playwright playwright;
  private Browser browser;

  @BeforeEach
  void setUp() throws IOException {
    this.publicHost = new RecordingServer();
    this.internal = new RecordingServer();
    this.trusted = new RecordingServer();
    this.trusted.servePage(
        "/render",
        "<html><body>"
            + "<img src='http://public.test:"
            + this.publicHost.port()
            + "/logo.png'>"
            + "<img src='http://127.0.0.1:"
            + this.internal.port()
            + "/internal.png'>"
            + "</body></html>");

    this.playwright = Playwright.create();
    this.browser =
        this.playwright
            .chromium()
            .launch(
                new BrowserType.LaunchOptions()
                    .setHeadless(true)
                    .setArgs(List.of("--host-resolver-rules=MAP public.test 127.0.0.1")));
  }

  @AfterEach
  void tearDown() {
    this.browser.close();
    this.playwright.close();
    this.trusted.stop();
    this.publicHost.stop();
    this.internal.stop();
  }

  @Test
  void the_render_token_reaches_the_trusted_origin_and_nobody_else() throws Exception {
    ReportRenderEgressGuard guard =
        new ReportRenderEgressGuard(
            "http://localhost:" + this.trusted.port(), 8080, false, this::resolve);

    try (BrowserContext context = this.browser.newContext()) {
      guard.install(context, RENDER_TOKEN);
      Page page = context.newPage();
      page.navigate("http://localhost:" + this.trusted.port() + "/render");
      page.waitForLoadState(LoadState.NETWORKIDLE);
      // A same-origin call, like the SPA's own API calls, must be authenticated too.
      page.evaluate("() => fetch('/api/ping').then(r => r.status)");
    }

    assertEquals(
        List.of(RENDER_TOKEN, RENDER_TOKEN),
        this.trusted.authorizationHeaders(),
        "page load and same-origin API call both carry the render token");
    assertEquals(
        Collections.singletonList(null),
        this.publicHost.authorizationHeaders(),
        "the public host is fetched, but without any Authorization header");
    assertTrue(
        this.internal.authorizationHeaders().isEmpty(),
        "the internal target must never be contacted at all");
  }

  /** The guard thinks {@code public.test} is public; everything else resolves for real. */
  private InetAddress[] resolve(final String host) throws java.net.UnknownHostException {
    if ("public.test".equals(host)) {
      return new InetAddress[] {InetAddress.getByName("8.8.8.8")};
    }
    return InetAddress.getAllByName(host);
  }

  /** Tiny HTTP server that records the Authorization header of every request it receives. */
  private static final class RecordingServer {
    private final HttpServer server;
    private final List<String> authorizationHeaders =
        Collections.synchronizedList(new ArrayList<>());

    RecordingServer() throws IOException {
      this.server = HttpServer.create(new InetSocketAddress(0), 0);
      // Default context: record and answer an empty png, for the images and the api call.
      this.server.createContext(
          "/",
          exchange -> {
            this.authorizationHeaders.add(exchange.getRequestHeaders().getFirst("Authorization"));
            exchange.getResponseHeaders().add("Content-Type", "image/png");
            exchange.sendResponseHeaders(200, -1);
            exchange.close();
          });
      this.server.start();
    }

    void servePage(final String path, final String html) {
      this.server.removeContext("/");
      this.server.createContext(
          path,
          exchange -> {
            this.authorizationHeaders.add(exchange.getRequestHeaders().getFirst("Authorization"));
            byte[] body = html.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "text/html; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
          });
      this.server.createContext(
          "/api",
          exchange -> {
            this.authorizationHeaders.add(exchange.getRequestHeaders().getFirst("Authorization"));
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
          });
    }

    int port() {
      return this.server.getAddress().getPort();
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
