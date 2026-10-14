package io.openaev.config;

import com.rabbitmq.client.ConnectionFactory;
import java.io.InputStream;
import java.net.Socket;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLEngine;
import javax.net.ssl.TrustManager;
import javax.net.ssl.TrustManagerFactory;
import javax.net.ssl.X509ExtendedTrustManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RabbitMQSslConfiguration {
  /**
   * Configures SSL settings for the ConnectionFactory.
   *
   * @param factory the ConnectionFactory to configure
   * @throws Exception if SSL configuration fails
   */
  public void configureSsl(ConnectionFactory factory, RabbitmqConfig rabbitmqConfig)
      throws Exception {
    SSLContext sslContext = trustStoreSslContext(rabbitmqConfig);
    if (sslContext != null) {
      factory.useSslProtocol(sslContext);
    } else {
      // Use default SSL context if no custom trust store is provided
      factory.useSslProtocol();
    }
    log.debug("SSL configured for RabbitMQ connection");
  }

  /** SSL context for the calls to the management plugin. */
  public SSLContext managementSslContext(RabbitmqConfig rabbitmqConfig) throws Exception {
    if (rabbitmqConfig.isManagementInsecure()) {
      SSLContext sslContext = SSLContext.getInstance("TLS");
      sslContext.init(null, new TrustManager[] {new TrustAllManager()}, null);
      return sslContext;
    }
    SSLContext sslContext = trustStoreSslContext(rabbitmqConfig);
    return sslContext != null ? sslContext : SSLContext.getDefault();
  }

  private SSLContext trustStoreSslContext(RabbitmqConfig rabbitmqConfig) throws Exception {
    if (rabbitmqConfig.getTrustStore() == null || !rabbitmqConfig.getTrustStore().exists()) {
      return null;
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

  // Extended manager so the JDK does not add its own hostname check on top.
  private static final class TrustAllManager extends X509ExtendedTrustManager {
    @Override
    public void checkClientTrusted(X509Certificate[] chain, String authType) {}

    @Override
    public void checkServerTrusted(X509Certificate[] chain, String authType) {}

    @Override
    public void checkClientTrusted(X509Certificate[] chain, String authType, Socket socket) {}

    @Override
    public void checkServerTrusted(X509Certificate[] chain, String authType, Socket socket) {}

    @Override
    public void checkClientTrusted(X509Certificate[] chain, String authType, SSLEngine engine) {}

    @Override
    public void checkServerTrusted(X509Certificate[] chain, String authType, SSLEngine engine) {}

    @Override
    public X509Certificate[] getAcceptedIssuers() {
      return new X509Certificate[0];
    }
  }
}
