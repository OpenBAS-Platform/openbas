package io.openbas.rest.settings.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PolicyInput {

  @JsonProperty("platform_login_message")
  private String loginMessage;

  @JsonProperty("platform_consent_message")
  private String consentMessage;

  @JsonProperty("platform_consent_confirm_text")
  private String consentConfirmText;
}
