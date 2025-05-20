package io.openbas.rest.helper.queue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.*;
import io.openbas.config.QueueConfig;
import io.openbas.config.RabbitmqConfig;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class BatchQueueService<T> {

  private final Class<T> clazz;
  private final QueueExecution<T> queueExecution;

  public static final String ROUTING_KEY = "_push_routing_%s";
  public static final String EXCHANGE_KEY = "_amqp.%s.exchange";
  public static final String QUEUE_NAME = "_execution_%s";

  protected ObjectMapper mapper;

  private final Connection connection;
  private final Channel publisherChannel;

  private final String routingKey;
  private final String exchangeName;
  private final String queueName;

  private final BlockingQueue<T> queue;

  private final QueueConfig queueConfig;

  /**
   * Public constructor of the BatchQueueService
   *
   * @param clazz the class of element that will be processed
   * @param queueExecution the method to handle a list of the class element
   * @param rabbitmqConfig the rabbitmq config object
   * @param mapper the mapper to use
   * @param queueConfig the queue config to use
   * @throws IOException In case of issue when communicating with rabbitMQ
   * @throws TimeoutException In case of a non responding rabbitMQ
   */
  public BatchQueueService(
      Class<T> clazz,
      QueueExecution<T> queueExecution,
      RabbitmqConfig rabbitmqConfig,
      ObjectMapper mapper,
      QueueConfig queueConfig)
      throws IOException, TimeoutException {
    this.clazz = clazz;
    this.queueExecution = queueExecution;
    this.mapper = mapper;
    this.queueConfig = queueConfig;

    // Init a Connection factory
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost(rabbitmqConfig.getHostname());
    factory.setPort(rabbitmqConfig.getPort());
    factory.setUsername(rabbitmqConfig.getUser());
    factory.setPassword(rabbitmqConfig.getPass());
    factory.setVirtualHost(rabbitmqConfig.getVhost());
    factory.setAutomaticRecoveryEnabled(true);
    factory.setNetworkRecoveryInterval(5000);
    factory.setRequestedHeartbeat(30);

    // Creation of the channels, exchange and queue
    connection = factory.newConnection();
    publisherChannel = connection.createChannel();
    publisherChannel.basicQos(queueConfig.getPublisherQos()); // Per publisher limit
    exchangeName =
        rabbitmqConfig.getPrefix()
            + String.format(BatchQueueService.EXCHANGE_KEY, queueConfig.getQueueName());
    routingKey =
        rabbitmqConfig.getPrefix()
            + String.format(BatchQueueService.ROUTING_KEY, queueConfig.getQueueName());
    queueName =
        rabbitmqConfig.getPrefix()
            + String.format(BatchQueueService.QUEUE_NAME, queueConfig.getQueueName());
    publisherChannel.exchangeDeclare(exchangeName, "topic", true);
    publisherChannel.queueDeclare(queueName, true, false, false, null);
    publisherChannel.queueBind(queueName, exchangeName, routingKey);

    // Create consumers that will handle the processing
    createConsumer();

    // The queue that will contain the object we need to process
    queue = new LinkedBlockingQueue<>();

    // A scheduler to handle batches that did not reached the critical mass
    ScheduledExecutorService scheduledExecutor = Executors.newScheduledThreadPool(1);
    scheduledExecutor.scheduleAtFixedRate(
        this::processBufferedBatch,
        this.queueConfig.getConsumerFrequency(),
        this.queueConfig.getConsumerFrequency(),
        TimeUnit.MILLISECONDS);
  }

  /**
   * Creates a consumer for the queue
   *
   * @throws IOException In case of issue when communicating with rabbitMQ
   */
  private void createConsumer() throws IOException {
    try {
      for (int i = 0; i < queueConfig.getConsumerNumber(); ++i) {
        Channel consumerChannel = connection.createChannel();
        consumerChannel.basicQos(queueConfig.getConsumerQos());

        // What to do when a message is consumed
        DeliverCallback deliverCallback =
            (consumerTag, delivery) -> {
              try {
                // We get the object to process
                String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
                log.trace("Received message from queue {} : '{}'", queueName, message);

                // Ack the message
                consumerChannel.basicAck(delivery.getEnvelope().getDeliveryTag(), true);

                // Unmarshalling of our object and setting it in the queue for processing
                T element = mapper.readValue(message, clazz);
                queue.put(element);

                // If we reach a critical mass, we take care of it immediately
                if (queue.size() > this.queueConfig.getMaxSize()) {
                  processBufferedBatch();
                }
              } catch (Exception e) {
                log.error("Error processing message: {}", e.getMessage());
                // Nack the message and sending it back to the queue
                consumerChannel.basicNack(delivery.getEnvelope().getDeliveryTag(), false, true);
              }
            };

        CancelCallback cancelCallback =
            consumerTag -> log.warn("Consumer {} was cancelled", consumerTag);

        // Setting up the consumer itself
        consumerChannel.basicConsume(
            queueName,
            false,
            String.format("consumer-%s-%d", queueConfig.getQueueName(), i),
            false,
            false,
            null,
            deliverCallback,
            cancelCallback);
      }
    } catch (IOException e) {
      log.error("Error creating consumer: {}", e.getMessage(), e);
      throw e;
    }
  }

  /**
   * Process messages in the queue buffer. It will only process as many messages as what's
   * configures in openbas.queue-config.<name of the queue>.max-size
   */
  private void processBufferedBatch() {
    try {
      // Draining the queue into the list with a max size
      List<T> currentBatch = new ArrayList<>();
      queue.drainTo(currentBatch, queueConfig.getMaxSize());

      // If the list is not empty, we process it
      if (!currentBatch.isEmpty()) {
        log.info("Processing batch of {}", currentBatch.size());
        queueExecution.perform(currentBatch);
      }

      // If the queue still has more element than we can process in one batch,
      // there is no need to wait : we process it right now
      if (queue.size() > this.queueConfig.getMaxSize()) {
        processBufferedBatch();
      }
    } catch (Exception e) {
      log.error(String.format("Error processing batch: %s", e.getMessage()), e);
    }
  }

  /**
   * Publish a stringified object of type T into the queue
   *
   * @param publishedJson the stringified T object
   * @throws IOException in case of error during the publish
   */
  public void publish(String publishedJson) throws IOException {
    try {
      publisherChannel.basicPublish(exchangeName, routingKey, null, publishedJson.getBytes());
    } catch (IOException e) {
      log.error(String.format("Error publishing batch: %s", e.getMessage()), e);
      throw e;
    }
  }
}
