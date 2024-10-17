package io.openbas.rest.team.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

public class TeamUpdateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("team_name")
  private String name;

  @JsonProperty("team_description")
  private String description;

  @JsonProperty("team_organization")
  private String organizationId;

  @JsonProperty("team_tags")
  private List<String> tagIds = new ArrayList<>();

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getOrganizationId() {
    return organizationId;
  }

  public void setOrganizationId(String organizationId) {
    this.organizationId = organizationId;
  }

  public List<String> getTagIds() {
    return tagIds;
  }

  public void setTagIds(List<String> tagIds) {
    this.tagIds = tagIds;
  }
}
