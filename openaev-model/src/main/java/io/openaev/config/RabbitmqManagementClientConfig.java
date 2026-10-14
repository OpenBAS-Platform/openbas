package io.openaev.config;

import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Produces the {@link HttpClient} bean used by RabbitmqManagementClient. */
@Configuration
public class RabbitmqManagementClientConfig {

  @Bean
  public HttpClient rabbitmqManagementHttpClient(
      RabbitmqConfig rabbitmqConfig, RabbitMQSslConfiguration rabbitMQSslConfiguration)
      throws Exception {
    HttpClient.Builder builder = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30));
    if (rabbitmqConfig.isSsl()) {
      builder.sslContext(rabbitMQSslConfiguration.sslContext(rabbitmqConfig));
    }
    return builder.build();
  }
}
