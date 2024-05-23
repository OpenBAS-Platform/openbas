package io.openbas.collectors.sentinel.client;

import io.openbas.collectors.sentinel.config.CollectorSentinelConfig;
import lombok.extern.java.Log;
import org.apache.hc.core5.http.Header;
import org.apache.hc.core5.http.message.BasicHeader;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.logging.Level;

import static org.apache.hc.core5.http.HttpHeaders.ACCEPT;
import static org.apache.hc.core5.http.HttpHeaders.AUTHORIZATION;

@Log
public abstract class RestApiCaller<T extends AuthenticationClient> {

  protected T authenticationClient;
  protected CollectorSentinelConfig collectorSentinelConfig;
  protected List<Header> headers;

  public RestApiCaller(
      T authenticationClient,
      CollectorSentinelConfig collectorSentinelConfig
  ) {
    try {
      this.authenticationClient = authenticationClient;
      this.collectorSentinelConfig = collectorSentinelConfig;
      this.headers = this.createHeaders();
    } catch (ExecutionException e) {
      log.log(Level.SEVERE, "Error creating rest api caller : " + this.getClass().getSimpleName());
      this.authenticationClient = null;
      this.collectorSentinelConfig = null;
      this.headers = null;
    } catch (IOException | InterruptedException e) {
      throw new RuntimeException(e);
    }
  }

  private List<Header> createHeaders() throws IOException, ExecutionException, InterruptedException {
    List<Header> headers = new ArrayList<>();
    headers.add(new BasicHeader(AUTHORIZATION, "Bearer " + fetchAccessTokenLog()));
    headers.add(new BasicHeader(ACCEPT, MediaType.APPLICATION_JSON));
    return headers;
  }

  private String fetchAccessTokenLog() throws IOException, ExecutionException, InterruptedException {
    return this.authenticationClient.fetchToken().accessToken();
  }

}
