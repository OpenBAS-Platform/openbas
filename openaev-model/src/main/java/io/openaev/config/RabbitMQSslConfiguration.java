package io.openaev.config;

import com.rabbitmq.client.ConnectionFactory;
import java.io.InputStream;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509TrustManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RabbitMQSslConfiguration {
  // Same as amqp-client's TrustEverythingTrustManager, which is not public.
  private static final TrustManager TRUST_EVERYTHING =
      new X509TrustManager() {
        @Override
        public void checkClientTrusted(X509Certificate[] chain, String authType) {}

        @Override
        public void checkServerTrusted(X509Certificate[] chain, String authType) {}

        @Override
        public X509Certificate[] getAcceptedIssuers() {
          return new X509Certificate[0];
        }
      };

  /**
   * Configures SSL settings for the ConnectionFactory.
   *
   * @param factory the ConnectionFactory to configure
   * @throws Exception if SSL configuration fails
   */
  public void configureSsl(ConnectionFactory factory, RabbitmqConfig rabbitmqConfig)
      throws Exception {
    factory.useSslProtocol(sslContext(rabbitmqConfig));
    log.debug("SSL configured for RabbitMQ connection");
  }

  /** SSL context trusting the configured trust store, or any certificate when none is set. */
  public SSLContext sslContext(RabbitmqConfig rabbitmqConfig) throws Exception {
    if (rabbitmqConfig.getTrustStore() == null || !rabbitmqConfig.getTrustStore().exists()) {
      SSLContext sslContext = SSLContext.getInstance("TLS");
      sslContext.init(null, new TrustManager[] {TRUST_EVERYTHING}, null);
      return sslContext;
    }
    KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
    try (InputStream trustStoreStream = rabbitmqConfig.getTrustStore().getInputStream()) {
      String password = rabbitmqConfig.getTrustStorePassword();
      trustStore.load(trustStoreStream, password != null ? password.toCharArray() : null);
    }

    TrustManagerFactory trustManagerFactory =
        TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    trustManagerFactory.init(trustStore);

    SSLContext sslContext = SSLContext.getInstance("TLSv1.3");
    sslContext.init(null, trustManagerFactory.getTrustManagers(), null);
    return sslContext;
  }
}
