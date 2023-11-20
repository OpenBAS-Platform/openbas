package io.openex.rest.user.form.player;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePlayerInput extends CreatePlayerInput {

  @JsonProperty("user_phone")
  private String phone;

  @JsonProperty("user_phone2")
  private String phone2;

  @JsonProperty("user_pgp_key")
  private String pgpKey;

}
