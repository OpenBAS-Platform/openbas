package io.openex.rest.user.form.player;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Pattern;

import static io.openex.config.AppConfig.PHONE_FORMAT;

@Getter
@Setter
public class UpdatePlayerInput extends CreatePlayerInput {

  @JsonProperty("user_phone")
  @Pattern(regexp="^\\+", message = PHONE_FORMAT)
  private String phone;

  @JsonProperty("user_phone2")
  private String phone2;

  @JsonProperty("user_pgp_key")
  private String pgpKey;

}
