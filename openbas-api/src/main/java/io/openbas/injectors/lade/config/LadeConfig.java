package io.openbas.injectors.lade.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import jakarta.validation.constraints.NotNull;

@Setter
@Getter
@Component
@ConfigurationProperties(prefix = "lade")
public class LadeConfig {

  @NotNull
  private Boolean enable;

  @NotNull
  private String url;

  @NotNull
  private Integer session;

  @NotNull
  private String username;

  @NotNull
  private String password;

}
