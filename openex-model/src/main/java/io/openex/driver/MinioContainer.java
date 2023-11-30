package io.openex.driver;

import io.openex.config.MinioConfig;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.HttpWaitStrategy;
import org.testcontainers.utility.Base58;

import javax.validation.constraints.NotNull;
import java.time.Duration;

public class MinioContainer extends GenericContainer<MinioContainer> {

  private static final int DEFAULT_PORT = 9000;
  private static final String DEFAULT_IMAGE = "minio/minio";
  private static final String DEFAULT_TAG = "latest";

  private static final String MINIO_ACCESS_KEY = "MINIO_ACCESS_KEY";
  private static final String MINIO_SECRET_KEY = "MINIO_SECRET_KEY";

  private static final String DEFAULT_STORAGE_DIRECTORY = "/data";
  private static final String HEALTH_ENDPOINT = "/minio/health/ready";

  public MinioContainer(@NotNull final MinioConfig minioConfig) {
    super(DEFAULT_IMAGE + ":" + DEFAULT_TAG);
    withNetworkAliases("minio-" + Base58.randomString(6));
    addExposedPort(DEFAULT_PORT);
    withEnv(MINIO_ACCESS_KEY, minioConfig.getAccessKey());
    withEnv(MINIO_SECRET_KEY, minioConfig.getAccessSecret());
    withCommand("server", DEFAULT_STORAGE_DIRECTORY);
    setWaitStrategy(new HttpWaitStrategy()
        .forPort(DEFAULT_PORT)
        .forPath(HEALTH_ENDPOINT)
        .withStartupTimeout(Duration.ofMinutes(2)));
  }

  public String getHostAddress() {
    return getContainerIpAddress() + ":" + getMappedPort(DEFAULT_PORT);
  }

}
