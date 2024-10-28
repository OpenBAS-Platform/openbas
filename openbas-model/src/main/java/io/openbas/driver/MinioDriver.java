package io.openbas.driver;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.openbas.config.MinioConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class MinioDriver {
  private MinioConfig minioConfig;

  @Autowired
  public void setMinioConfig(MinioConfig minioConfig) {
    this.minioConfig = minioConfig;
  }

  @Bean
  public MinioClient minioClient() throws Exception {
    MinioClient minioClient =
        MinioClient.builder()
            .endpoint(minioConfig.getEndpoint(), minioConfig.getPort(), minioConfig.isSecure())
            .credentials(minioConfig.getAccessKey(), minioConfig.getAccessSecret())
            .build();
    // Make bucket if not exist.
    BucketExistsArgs bucketExistsArgs =
        BucketExistsArgs.builder().bucket(minioConfig.getBucket()).build();
    boolean found = minioClient.bucketExists(bucketExistsArgs);
    if (!found) {
      minioClient.makeBucket(MakeBucketArgs.builder().bucket(minioConfig.getBucket()).build());
    }
    return minioClient;
  }
}
