package io.openbas.rest.user.form.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class UserOutput {

  @JsonProperty("user_id")
  @NotBlank
  private String id;

  @JsonProperty("user_firstname")
  private String firstname;

  @JsonProperty("user_lastname")
  private String lastname;

  @JsonProperty("user_email")
  @NotBlank
  private String email;

  @JsonProperty("user_admin")
  private boolean admin;

  @JsonProperty("user_organization_name")
  private String organizationName;

  @JsonProperty("user_tags")
  private Set<String> tags;
}
