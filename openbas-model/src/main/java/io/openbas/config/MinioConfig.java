package io.openbas.config;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.validation.constraints.NotNull;

@Component
@ConfigurationProperties(prefix = "minio")
@Data
public class MinioConfig {

    @NotNull
    private String endpoint;

    @NotNull
    private String accessKey;

    @NotNull
    private String accessSecret;

    private int port = 9000;
    private String bucket = "openbas";
    private boolean secure = false;
}
