package io.openbas.collectors.sentinel.client;

import io.openbas.collectors.sentinel.config.CollectorSentinelConfig;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.Header;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.concurrent.ExecutionException;

import static io.openbas.collectors.sentinel.client.resourcetype.LogAnalyticsResourceType.FILTER_UPDATED_SINCE_GREATER_THAN;
import static io.openbas.collectors.sentinel.client.resourcetype.LogAnalyticsResourceType.QUERY_SECURITY_ALERT;

@Service
@ConditionalOnProperty(prefix = "collector.sentinel", name = "enable")
public class LogAnalyticsRestApiCaller extends RestApiCaller<LogAnalyticsAuthenticationClient> {

  private static final String LOG_ANALYTICS_BASE_URL = "https://api.loganalytics.io/v1/";

  public LogAnalyticsRestApiCaller(
      LogAnalyticsAuthenticationClient authenticationClient,
      CollectorSentinelConfig collectorSentinelConfig) throws IOException, ExecutionException, InterruptedException {
    super(authenticationClient, collectorSentinelConfig);
  }

  private UriComponentsBuilder buildUri() {
    String url = LOG_ANALYTICS_BASE_URL + this.collectorSentinelConfig.getSubscription().getBaseUri() + "/query";
    int expirationTime = this.collectorSentinelConfig.getExpirationTimeInMinute();
    return UriComponentsBuilder.fromHttpUrl(url)
        .query(FILTER_UPDATED_SINCE_GREATER_THAN.getParam() + expirationTime + "M");
  }

  public String retrieveSecurityAlert() {
    URI uri = buildUri()
        .build()
        .toUri();
    try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
      HttpPost httpPost = new HttpPost(uri);
      // Headers
      for (Header header : this.headers) {
        httpPost.setHeader(header);
      }
      StringEntity httpBody = new StringEntity(QUERY_SECURITY_ALERT.getParam(), ContentType.APPLICATION_JSON);
      httpPost.setEntity(httpBody);

      return httpClient.execute(
          httpPost,
          response -> EntityUtils.toString(response.getEntity())
      );
    } catch (IOException e) {
      throw new RuntimeException("Unexpected response for request on: " + uri);
    }
  }
}
