package io.openbas.rest.asset.security_platforms.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.SecurityPlatform;
import io.openbas.rest.asset.form.AssetInput;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class SecurityPlatformInput extends AssetInput {

  @NotNull(message = MANDATORY_MESSAGE)
  @JsonProperty("security_platform_type")
  private SecurityPlatform.SECURITY_TYPE securityPlatformType;

  @JsonProperty("security_platform_logo_light")
  private String logoLight;

  @JsonProperty("security_platform_logo_dark")
  private String logoDark;
}
