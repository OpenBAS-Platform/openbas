package io.openbas.injectors.opencti.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas.xtm.opencti")
@Data
public class OpenCTIConfig {

  @NotBlank private Boolean enable;

  @NotBlank private String url;
  private String apiUrl;

  @NotBlank private String token;

  public String getUrl() {
    return (apiUrl != null && !apiUrl.isBlank()) ? apiUrl : url + "/graphql";
  }
}
