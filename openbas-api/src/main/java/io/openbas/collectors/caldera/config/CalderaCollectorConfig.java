package io.openbas.collectors.caldera.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.validation.constraints.NotBlank;

@Setter
@Component
@ConfigurationProperties(prefix = "collector.caldera")
public class CalderaCollectorConfig {

  private final static String REST_V2_URI = "/api/v2";

  @Getter
  private boolean enable;

  @Getter
  @NotBlank
  private String id;

  @Getter
  private int interval = 60;

  @NotBlank
  private String url;

  @Getter
  @NotBlank
  private String apiKey;

  public String getRestApiV2Url() {
    return url + REST_V2_URI;
  }
}
