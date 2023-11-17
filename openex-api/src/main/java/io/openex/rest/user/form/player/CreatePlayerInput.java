package io.openex.rest.user.form.player;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import java.util.ArrayList;
import java.util.List;

import static io.openex.config.AppConfig.EMAIL_FORMAT;

@Getter
@Setter
public class CreatePlayerInput {

  @Email(message = EMAIL_FORMAT)
  @JsonProperty("user_email")
  private String email;

  @JsonProperty("user_firstname")
  private String firstname;

  @JsonProperty("user_lastname")
  private String lastname;

  @JsonProperty("user_organization")
  private String organizationId;

  @JsonProperty("user_country")
  private String country;

  @JsonProperty("user_tags")
  private List<String> tagIds = new ArrayList<>();

}
