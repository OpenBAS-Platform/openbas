package io.openbas.rest.settings.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SettingsPlatformWhitemarkUpdateInput {
  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("platform_whitemark")
  private String platformWhitemark;
}
