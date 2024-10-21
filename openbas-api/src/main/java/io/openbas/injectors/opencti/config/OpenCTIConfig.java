package io.openbas.injectors.opencti.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "openbas.xtm.opencti")
@Getter
@Setter
public class OpenCTIConfig {

  @NotBlank private Boolean enable;

  @NotBlank private String url;

  @NotBlank private String token;
}
