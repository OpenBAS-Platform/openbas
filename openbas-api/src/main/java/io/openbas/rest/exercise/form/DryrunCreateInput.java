package io.openbas.rest.exercise.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class DryrunCreateInput {
  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("dryrun_name")
  private String name;

  @JsonProperty("dryrun_users")
  private List<String> userIds = new ArrayList<>();

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<String> getUserIds() {
    return userIds;
  }

  public void setUserIds(List<String> userIds) {
    this.userIds = userIds;
  }
}
