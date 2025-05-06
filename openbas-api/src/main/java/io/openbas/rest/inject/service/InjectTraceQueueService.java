package io.openbas.rest.inject.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.*;
import io.openbas.config.RabbitmqConfig;
import io.openbas.rest.inject.form.InjectExecutionCallback;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.Level;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.stereotype.Service;

@Log
@Service
@RequiredArgsConstructor
public class InjectTraceQueueService {

  private final InjectStatusService injectStatusService;

  public static final String ROUTING_KEY = "_push_routing_exchange";
  public static final String EXCHANGE_KEY = "_amqp.traces.exchange";
  public static final String QUEUE_NAME = "_execution_traces_queue";

  @Resource protected ObjectMapper mapper;

  @Resource private RabbitmqConfig rabbitmqConfig;
  private Connection connection;
  private Channel channel;

  private String routingKey;
  private String exchangeName;
  private String queueName;

  private BlockingQueue<InjectExecutionCallback> queue;
  private final Object batchLock = new Object();
  private ScheduledExecutorService scheduledExecutor;
  private final AtomicBoolean processingBatch = new AtomicBoolean(false);

  @PostConstruct
  public void init() throws Exception {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost(rabbitmqConfig.getHostname());
    factory.setPort(rabbitmqConfig.getPort());
    factory.setUsername(rabbitmqConfig.getUser());
    factory.setPassword(rabbitmqConfig.getPass());
    factory.setVirtualHost(rabbitmqConfig.getVhost());

    factory.setAutomaticRecoveryEnabled(true);
    factory.setNetworkRecoveryInterval(5000);
    factory.setRequestedHeartbeat(30);

    connection = factory.newConnection();
    channel = connection.createChannel();
    channel.basicQos(30); // Per consumer limit
    exchangeName = rabbitmqConfig.getPrefix() + InjectTraceQueueService.EXCHANGE_KEY;
    routingKey = rabbitmqConfig.getPrefix() + InjectTraceQueueService.ROUTING_KEY;
    queueName = rabbitmqConfig.getPrefix() + InjectTraceQueueService.QUEUE_NAME;
    channel.exchangeDeclare(exchangeName, "topic", true);
    channel.queueDeclare(queueName, true, false, false, null);
    channel.queueBind(queueName, exchangeName, routingKey);

    setupConsumer();

    setupScheduledBatchProcessing();
  }

  private void setupConsumer() throws IOException {
    Channel consumerChannel = connection.createChannel();
    // Limiter le nombre de messages non acquittés
    consumerChannel.basicQos(30);

    DeliverCallback deliverCallback =
        (consumerTag, delivery) -> {
          try {
            String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
            log.info(" [x] Received '" + message + "'");

            // Acquitter le message immédiatement
            consumerChannel.basicAck(delivery.getEnvelope().getDeliveryTag(), false);

            InjectExecutionCallback injectExecutionCallback =
                mapper.readValue(message, InjectExecutionCallback.class);
            synchronized (batchLock) {
              queue.put(injectExecutionCallback);
            }

            if (queue.size() > 200) {
              processBufferedBatch();
            }
          } catch (Exception e) {
            log.log(Level.SEVERE, "Error processing message: {}", e.getMessage());
            // Rejeter le message et le renvoyer à la file
            consumerChannel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
          }
        };

    CancelCallback cancelCallback =
        consumerTag -> log.log(Level.WARNING, "Consumer {} was cancelled", consumerTag);

    consumerChannel.basicConsume(
        queueName, false, "consumer", false, false, null, deliverCallback, cancelCallback);
  }

  private void setupScheduledBatchProcessing() {
    queue = new LinkedBlockingQueue<>();

    scheduledExecutor = Executors.newScheduledThreadPool(1);
    scheduledExecutor.scheduleAtFixedRate(
        this::processBufferedBatch, 10000, 10000, TimeUnit.MILLISECONDS);
  }

  /** Traite les messages en attente dans le tampon */
  private void processBufferedBatch() {
    // Éviter les traitements simultanés
    if (!processingBatch.compareAndSet(false, true)) {
      return;
    }

    try {
      List<InjectExecutionCallback> currentBatch;

      // Récupérer et vider le tampon
      synchronized (batchLock) {
        if (queue.isEmpty()) {
          return;
        }

        currentBatch = new ArrayList<>(queue);
        queue.clear();
      }

      if (!currentBatch.isEmpty()) {
        log.log(Level.INFO, "Processing batch of {} callbacks", currentBatch.size());
        injectStatusService.handleInjectExecutionCallbackList(currentBatch);
      }
    } catch (Exception e) {
      log.log(Level.SEVERE, "Error processing batch: {}", e.getMessage());
    } finally {
      processingBatch.set(false);
    }
  }

  public void publish(String publishedJson) throws IOException, TimeoutException {
    channel.basicPublish(exchangeName, routingKey, null, publishedJson.getBytes());
  }
}
