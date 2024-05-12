package io.openbas.collectors.fake_detector.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties("collector.fake-detector")
@Getter
@Setter
public class CollectorFakeDetectorConfig {

  public static final String PRODUCT_NAME = "OpenBAS Fake Detector";

  private boolean enable = true;
  private String id = "96e476e0-b9c4-4660-869c-98585adf754d";
  private int interval = 60;
  private int expirationTime = 120;

  public int getExpirationTimeInMinute() {
    return this.expirationTime / 60;
  }
}

