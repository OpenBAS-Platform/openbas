package io.openbas.injectors.caldera.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Setter
@Component
@ConfigurationProperties(prefix = "injector.caldera")
public class CalderaInjectorConfig {

  public static final String PRODUCT_NAME = "Caldera";

  private final static String REST_V1_URI = "/api/rest";
  private final static String REST_V2_URI = "/api/v2";
  private final static String PLUGIN_ACCESS_URI = "/plugin/access";

  @Getter
  private boolean enable;

  @Getter
  @NotBlank
  private String id;

  @Getter
  @NotEmpty
  private List<String> collectorIds;

  @NotBlank
  private String url;

  @NotBlank
  private String publicUrl;

  @Getter
  @NotBlank
  private String apiKey;

  public String getRestApiV1Url() {
    return url + REST_V1_URI;
  }

  public String getRestApiV2Url() {
    return url + REST_V2_URI;
  }

  public String getPluginAccessApiUrl() {
    return url + PLUGIN_ACCESS_URI;
  }

  public String getUrl() {
    return url;
  }

  public String getPublicUrl() {
    return publicUrl;
  }
}
