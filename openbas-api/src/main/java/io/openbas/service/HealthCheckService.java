package io.openbas.service;

import com.cronutils.utils.VisibleForTesting;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import io.minio.errors.*;
import io.openbas.config.MinioConfig;
import io.openbas.config.RabbitmqConfig;
import io.openbas.database.repository.HealthCheckRepository;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.service.exception.HealthCheckFailureException;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.TimeoutException;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/** Service containing the logic related to service health checks */
@RequiredArgsConstructor
@Service
@Log
public class HealthCheckService {

  @Autowired private HealthCheckRepository healthCheckRepository;

  @Autowired private MinioConfig minioConfig;

  @Autowired private MinioClient minioClient;

  @Autowired private CalderaExecutorClient client;

  @Resource private RabbitmqConfig rabbitmqConfig;

  /**
   * Run health checks by testing connection to the service dependencies (database/rabbitMq/file
   * storage)
   *
   * @throws HealthCheckFailureException
   */
  public void runHealthCheck() throws HealthCheckFailureException {
    runDatabaseCheck();
    runRabbitMQCheck(createRabbitMQConnectionFactory());
    runCalderaCheck();
    runFileStorageCheck();
    // TODO add IMAP check
  }

  @VisibleForTesting
  protected void runDatabaseCheck() {
    //TODO add timeout
    healthCheckRepository.healthCheck();
  }

  @VisibleForTesting
  protected ConnectionFactory createRabbitMQConnectionFactory() {
    ConnectionFactory factory = new ConnectionFactory();
    factory.setHost(rabbitmqConfig.getHostname());
    factory.setPort(rabbitmqConfig.getPort());
    factory.setUsername(rabbitmqConfig.getUser());
    factory.setPassword(rabbitmqConfig.getPass());
    factory.setVirtualHost(rabbitmqConfig.getVhost());
    factory.setConnectionTimeout(2000);
    return factory;
  }

  @VisibleForTesting
  protected void runRabbitMQCheck(ConnectionFactory connectionFactory)
      throws HealthCheckFailureException {
    // Declare queueing
    Connection connection = null;
    try {
      connection = connectionFactory.newConnection();
      connection.createChannel();
    } catch (IOException | TimeoutException e) {
      throw new HealthCheckFailureException("RabbitMQ check failure", e);
    }
  }

  @VisibleForTesting
  protected void runFileStorageCheck() throws HealthCheckFailureException {
    try {
      // TODO: we should get a new instance to avoid update the timeout on the minio client injected
      // by spring
      minioClient.setTimeout(2000L, 2000L, 2000L);
      minioClient.bucketExists(BucketExistsArgs.builder().bucket(minioConfig.getBucket()).build());
    } catch (ErrorResponseException
        | InsufficientDataException
        | InternalException
        | InvalidKeyException
        | InvalidResponseException
        | IOException
        | NoSuchAlgorithmException
        | ServerException
        | XmlParserException e) {
      throw new HealthCheckFailureException("FileStorage check failure", e);
    }
  }

  @VisibleForTesting
  protected void runCalderaCheck() throws HealthCheckFailureException {
    try {
      this.client.healthCheck();
    } catch (Exception e) {
      throw new HealthCheckFailureException("Caldera check failure", e);
    }
  }
}
