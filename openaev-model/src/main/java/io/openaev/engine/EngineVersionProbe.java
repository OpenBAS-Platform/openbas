package io.openaev.engine;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openaev.config.EngineConfig;
import io.openaev.exception.StartupException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Base64;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import lombok.RequiredArgsConstructor;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.config.ConnectionConfig;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.ClientTlsStrategyBuilder;
import org.apache.hc.client5.http.ssl.HostnameVerificationPolicy;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.TlsSocketStrategy;
import org.apache.hc.client5.http.ssl.TrustAllStrategy;
import org.apache.hc.core5.http.HttpHeaders;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.util.Timeout;
import org.springframework.stereotype.Component;

/**
 * Asks the search engine what it is, before any engine client is built.
 *
 * <p>The answer of {@code GET /} carries {@code version.number} on every engine, and {@code
 * version.distribution = "opensearch"} on OpenSearch only. The probe uses its own short-lived
 * client, configured like the engine clients (TLS, basic auth, timeouts), since the right engine
 * client cannot be chosen until the answer is known.
 */
@Component
@RequiredArgsConstructor
public class EngineVersionProbe {

  /** What the engine reported about itself. */
  public record ServerInfo(String distribution, String number) {}

  private record RawResponse(int status, String body) {}

  private final EngineConfig config;
  private final X509TrustManager trustManager;
  private final ObjectMapper mapper = new ObjectMapper();

  /**
   * Calls {@code GET /} on {@code engine.url}.
   *
   * @return the distribution and version reported by the engine
   * @throws StartupException if the engine is unreachable, refuses the call or answers something
   *     that is not an Elasticsearch or OpenSearch root response
   */
  public ServerInfo detect() {
    String url = config.getUrl();
    HttpGet request;
    try {
      request = new HttpGet(url);
    } catch (IllegalArgumentException e) {
      throw new StartupException("Invalid search engine url '" + url + "'", e);
    }
    request.setHeader(HttpHeaders.ACCEPT, "application/json");
    if (config.getUsername() != null) {
      String password = config.getPassword() == null ? "" : config.getPassword();
      String credentials =
          Base64.getEncoder()
              .encodeToString(
                  (config.getUsername() + ":" + password).getBytes(StandardCharsets.UTF_8));
      request.setHeader(HttpHeaders.AUTHORIZATION, "Basic " + credentials);
    }

    RawResponse response;
    try (CloseableHttpClient client = httpClient()) {
      response =
          client.execute(
              request,
              r ->
                  new RawResponse(
                      r.getCode(),
                      r.getEntity() == null
                          ? ""
                          : EntityUtils.toString(r.getEntity(), StandardCharsets.UTF_8)));
    } catch (IOException e) {
      throw new StartupException(
          "Unable to reach the search engine at " + url + " to detect its version", e);
    }

    if (response.status() == 401 || response.status() == 403) {
      throw new StartupException(
          "The search engine at "
              + url
              + " refused the version detection (HTTP "
              + response.status()
              + "): check engine.username and engine.password");
    }
    if (response.status() != 200) {
      throw new StartupException(
          "The search engine at "
              + url
              + " answered HTTP "
              + response.status()
              + " to the version detection");
    }
    return parse(url, response.body());
  }

  private ServerInfo parse(String url, String body) {
    JsonNode version;
    try {
      version = mapper.readTree(body).path("version");
    } catch (IOException e) {
      throw new StartupException(
          "The search engine at " + url + " answered a non-JSON body to the version detection", e);
    }
    if (!version.hasNonNull("number")) {
      throw new StartupException(
          "The server at " + url + " does not look like Elasticsearch or OpenSearch: no version");
    }
    String distribution =
        version.hasNonNull("distribution") ? version.get("distribution").asText() : null;
    return new ServerInfo(distribution, version.get("number").asText());
  }

  private CloseableHttpClient httpClient() {
    Timeout connectTimeout = Timeout.ofMilliseconds(config.getConnectTimeoutMs());
    Timeout socketTimeout = Timeout.ofMilliseconds(config.getSocketTimeoutMs());
    return HttpClients.custom()
        .disableAutomaticRetries()
        .setConnectionManager(
            PoolingHttpClientConnectionManagerBuilder.create()
                .setTlsSocketStrategy(tlsStrategy())
                .setDefaultConnectionConfig(
                    ConnectionConfig.custom()
                        .setConnectTimeout(connectTimeout)
                        .setSocketTimeout(socketTimeout)
                        .build())
                .build())
        .setDefaultRequestConfig(RequestConfig.custom().setResponseTimeout(socketTimeout).build())
        .build();
  }

  /** Same trust rules as the engine clients: the platform chain, or nothing at all. */
  private TlsSocketStrategy tlsStrategy() {
    try {
      if (!config.isRejectUnauthorized()) {
        return ClientTlsStrategyBuilder.create()
            .setSslContext(
                SSLContextBuilder.create().loadTrustMaterial(TrustAllStrategy.INSTANCE).build())
            .setHostVerificationPolicy(HostnameVerificationPolicy.CLIENT)
            .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
            .buildClassic();
      }
      SSLContext sslContext = SSLContext.getInstance("TLS");
      sslContext.init(null, new TrustManager[] {trustManager}, null);
      return ClientTlsStrategyBuilder.create().setSslContext(sslContext).buildClassic();
    } catch (GeneralSecurityException e) {
      throw new StartupException("Unable to build the engine TLS context", e);
    }
  }
}
