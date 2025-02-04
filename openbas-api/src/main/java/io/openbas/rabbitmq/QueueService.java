package io.openbas.rabbitmq;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import io.openbas.rabbitmq.response.QueueConnection;
import io.openbas.rabbitmq.response.QueueRegistration;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import lombok.extern.java.Log;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.connection.Connection;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.stereotype.Service;

@Log
@Service
public class QueueService {

  public static final String ROUTING_KEY = "_push_routing_";
  public static final String EXCHANGE_KEY = "_amqp.connector.exchange";

  @Resource protected ObjectMapper mapper;

  @Resource private RabbitmqConfig rabbitmqConfig;

  @Resource protected ConnectionFactory connectionFactory;

  // -- CRUD --

  public QueueRegistration createQueue(
      String queueNameSuffix, String routingSuffix, Runnable callback) {
    String queueName = rabbitmqConfig.getPrefix() + queueNameSuffix;
    String routingKey = rabbitmqConfig.getPrefix() + ROUTING_KEY + routingSuffix;
    String exchangeKey = rabbitmqConfig.getPrefix() + EXCHANGE_KEY;

    try (Connection connection = connectionFactory.createConnection();
        Channel channel = connection.createChannel(true)) {

      declareExchange(channel, exchangeKey);
      declareQueue(channel, queueName);
      channel.queueBind(queueName, exchangeKey, routingKey);

      QueueConnection conn =
          new QueueConnection(
              rabbitmqConfig.getHostname(),
              rabbitmqConfig.getVhost(),
              rabbitmqConfig.isSsl(),
              rabbitmqConfig.getPort(),
              rabbitmqConfig.getUser(),
              rabbitmqConfig.getPass());

      QueueRegistration queueRegistration = new QueueRegistration(conn, queueName);
      callback.run();
      return queueRegistration;
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error while creating RabbitMQ queue: " + queueName, e);
      throw new RuntimeException("Failed to create queue: " + queueName, e);
    }
  }

  private void declareExchange(Channel channel, String exchangeKey) throws Exception {
    channel.exchangeDeclare(exchangeKey, "direct", true);
  }

  private void declareQueue(Channel channel, String queueName) throws Exception {
    Map<String, Object> queueOptions = new HashMap<>();
    queueOptions.put("x-queue-type", rabbitmqConfig.getQueueType());
    channel.queueDeclare(queueName, true, false, false, queueOptions);
  }

  // -- MESSAGE -

  public void publish(String injectType, String publishedJson) {
    String routingKey = rabbitmqConfig.getPrefix() + ROUTING_KEY + injectType;
    String exchangeKey = rabbitmqConfig.getPrefix() + EXCHANGE_KEY;

    try (Connection connection = connectionFactory.createConnection();
        Channel channel = connection.createChannel(true)) {

      publishMessage(channel, exchangeKey, routingKey, publishedJson);

    } catch (IOException | AmqpException | TimeoutException e) {
      log.log(Level.SEVERE, "Error publishing message to RabbitMQ: " + publishedJson, e);
      throw new RuntimeException("Failed to publish message", e);
    }
  }

  private void publishMessage(
      Channel channel, String exchangeKey, String routingKey, String message) throws IOException {
    channel.basicPublish(exchangeKey, routingKey, null, message.getBytes());
  }
}
