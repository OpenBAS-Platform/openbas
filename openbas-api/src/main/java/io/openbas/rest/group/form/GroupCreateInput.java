package io.openbas.rest.group.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.DefaultGrant;
import jakarta.validation.constraints.NotBlank;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupCreateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("group_name")
  private String name;

  @JsonProperty("group_description")
  private String description;

  @JsonProperty("group_default_user_assign")
  private boolean defaultUserAssignation;
}
