package io.openex.rest.audience.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateUsersAudienceInput {

  @JsonProperty("audience_users")
  private List<String> userIds;

}
