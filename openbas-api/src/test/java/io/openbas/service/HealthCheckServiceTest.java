package io.openbas.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import io.minio.errors.*;
import io.openbas.config.MinioConfig;
import io.openbas.database.repository.*;
import io.openbas.driver.MinioDriver;
import io.openbas.executors.caldera.client.CalderaExecutorClient;
import io.openbas.service.exception.HealthCheckFailureException;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class HealthCheckServiceTest {

  private static final String BUCKET = "bucket";

  @Mock private HealthCheckRepository healthCheckRepository;
  @Mock private MinioConfig minioConfig;
  @Mock private MinioDriver minioDriver;
  @Mock private MinioClient minioClient;
  @Mock private ConnectionFactory connectionFactory;
  @Mock private Connection connection;
  @Mock private CalderaExecutorClient calderaExecutorClient;

  @InjectMocks private HealthCheckService healthCheckService;

  @DisplayName("Test runDatabaseCheck")
  @Test
  void test_runDatabaseCheck() {
    healthCheckService.runDatabaseCheck();
    verify(healthCheckRepository).healthCheck();
  }

  @DisplayName("Test runFileStorageCheck")
  @Test
  void test_runFileStorageCheck() throws Exception {
    when(minioDriver.getMinioClient()).thenReturn(minioClient);
    when(minioConfig.getBucket()).thenReturn(BUCKET);
    healthCheckService.runFileStorageCheck();
    verify(minioClient).bucketExists(BucketExistsArgs.builder().bucket(BUCKET).build());
  }

  @DisplayName("Test runFileStorageCheck when check fails ")
  @Test
  void test_runFileStorageCheck_WHEN_client_throws_exception()
      throws HealthCheckFailureException,
          ServerException,
          InsufficientDataException,
          ErrorResponseException,
          IOException,
          NoSuchAlgorithmException,
          InvalidKeyException,
          InvalidResponseException,
          XmlParserException,
          InternalException {
    when(minioConfig.getBucket()).thenReturn(BUCKET);
    when(minioClient.bucketExists(BucketExistsArgs.builder().bucket(BUCKET).build()))
        .thenThrow(new IOException("test"));
    assertThrows(
        HealthCheckFailureException.class,
        () -> {
          healthCheckService.runFileStorageCheck();
        });
  }

  @DisplayName("Test runRabbitMQCheck")
  @Test
  void test_runRabbitMQCheck() throws HealthCheckFailureException, IOException, TimeoutException {
    when(connectionFactory.newConnection()).thenReturn(connection);
    healthCheckService.runRabbitMQCheck(connectionFactory);
  }

  @DisplayName("Test runRabbitMQCheck when check fails")
  @Test
  void test_runRabbitMQCheck_WHEN_connection_throws_exception()
      throws HealthCheckFailureException, IOException, TimeoutException {
    when(connectionFactory.newConnection()).thenThrow(new TimeoutException());
    assertThrows(
        HealthCheckFailureException.class,
        () -> {
          healthCheckService.runRabbitMQCheck(connectionFactory);
        });
  }
}
