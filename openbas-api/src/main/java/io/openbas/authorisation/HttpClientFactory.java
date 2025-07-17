package io.openbas.authorisation;

import javax.net.ssl.SSLContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.io.HttpClientConnectionManager;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class HttpClientFactory {

  private final SSLContext tlsContext;

  public CloseableHttpClient httpClientCustom() {
    try {
      SSLConnectionSocketFactory sslConFactory =
          SSLConnectionSocketFactoryBuilder.create().setSslContext(tlsContext).build();
      HttpClientConnectionManager cm =
          PoolingHttpClientConnectionManagerBuilder.create()
              .setSSLSocketFactory(sslConFactory)
              .build();
      return HttpClients.custom().setConnectionManager(cm).build();
    } catch (Exception e) {
      log.error("Unable to load the custom ssl context", e);
      return HttpClients.createDefault();
    }
  }
}
