package io.openbas.asset;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.config.OpenBASConfig;
import jakarta.annotation.Resource;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

@Log
@Service
public class QueueService {

  public static final String ROUTING_KEY = "_push_routing_";
  public static final String EXCHANGE_KEY = "_amqp.connector.exchange";

  @Resource
  protected ObjectMapper mapper;

  @Resource
  private OpenBASConfig openBASConfig;

  public void publish(String injectType, String publishedJson) throws IOException, TimeoutException {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost(openBASConfig.getRabbitmqHostname());
    Connection connection = null;
    try {
      connection = factory.newConnection();
      Channel channel = connection.createChannel();
      String routingKey = openBASConfig.getRabbitmqPrefix() + ROUTING_KEY + injectType;
      String exchangeKey = openBASConfig.getRabbitmqPrefix() + EXCHANGE_KEY;
      channel.basicPublish(exchangeKey, routingKey, null, publishedJson.getBytes());
    } finally {
      if (connection != null) {
        try {
          connection.close();
        } catch (IOException ex) {
          log.severe("Unable to close RabbitMQ connection. You should worry as this could impact performance");
        }
      }
    }
  }
}
