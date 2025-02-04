package io.openbas.rabbitmq;

import jakarta.annotation.Resource;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConnectionFactoryConfig {

  @Resource private RabbitmqConfig rabbitmqConfig;

  @Bean
  public ConnectionFactory createFactory() {
    // FIXME: verifier que j'ai pris la bonne classe
    CachingConnectionFactory factory = new CachingConnectionFactory();
    factory.setHost(rabbitmqConfig.getHostname());
    factory.setPort(rabbitmqConfig.getPort());
    factory.setUsername(rabbitmqConfig.getUser());
    factory.setPassword(rabbitmqConfig.getPass());
    factory.setVirtualHost(rabbitmqConfig.getVhost());
    return factory;
  }
}
