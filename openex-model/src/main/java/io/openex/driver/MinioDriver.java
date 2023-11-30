package io.openex.driver;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.openex.config.MinioConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;
import javax.validation.constraints.NotNull;

@Component
@RequiredArgsConstructor
public class MinioDriver {

  private final MinioConfig minioConfig;
  private MinioContainer container;

  @PreDestroy
  public void preDestroy() {
    if (this.container != null) {
      this.container.close();
    }
  }

  @Bean
  @Profile("!test")
  public MinioClient minioClient() throws Exception {
    MinioClient minioClient = MinioClient.builder()
        .endpoint(this.minioConfig.getEndpoint(), this.minioConfig.getPort(), this.minioConfig.isSecure())
        .credentials(this.minioConfig.getAccessKey(), this.minioConfig.getAccessSecret())
        .build();
    this.initBucket(minioClient);
    return minioClient;
  }

  @Bean
  @Profile("test")
  public MinioClient minioClientTest() throws Exception {
    try (MinioContainer container = new MinioContainer(this.minioConfig)) {
      this.container = container;
      this.container.start();
      MinioClient minioClient = MinioClient.builder()
          .endpoint("http://" + container.getHostAddress())
          .credentials(this.minioConfig.getAccessKey(), this.minioConfig.getAccessSecret())
          .build();
      this.initBucket(minioClient);
      return minioClient;
    }
  }

  private void initBucket(@NotNull final MinioClient minioClient) throws Exception {
    // Make bucket if not exist.
    BucketExistsArgs bucketExistsArgs = BucketExistsArgs.builder().bucket(this.minioConfig.getBucket()).build();
    boolean found = minioClient.bucketExists(bucketExistsArgs);
    if (!found) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(this.minioConfig.getBucket()).build());
    }
  }
}
