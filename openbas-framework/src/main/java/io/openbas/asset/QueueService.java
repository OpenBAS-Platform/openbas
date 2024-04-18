package io.openbas.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.openbas.config.OpenBASConfig;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.concurrent.TimeoutException;
import org.springframework.stereotype.Service;

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
    Connection connection = factory.newConnection();
    Channel channel = connection.createChannel();
    String routingKey = openBASConfig.getRabbitmqPrefix() + ROUTING_KEY + injectType;
    String exchangeKey = openBASConfig.getRabbitmqPrefix() + EXCHANGE_KEY;
    channel.basicPublish(exchangeKey, routingKey, null, publishedJson.getBytes());
  }
}
