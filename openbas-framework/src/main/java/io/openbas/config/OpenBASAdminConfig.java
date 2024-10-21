package io.openbas.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas.admin")
@Data
public class OpenBASAdminConfig {
  @JsonProperty("admin_token")
  private String token;
}
