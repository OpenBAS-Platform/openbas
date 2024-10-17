package io.openbas.rest.user.form.user;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class RenewTokenInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("token_id")
  private String tokenId;

  public String getTokenId() {
    return tokenId;
  }

  public void setTokenId(String tokenId) {
    this.tokenId = tokenId;
  }
}
