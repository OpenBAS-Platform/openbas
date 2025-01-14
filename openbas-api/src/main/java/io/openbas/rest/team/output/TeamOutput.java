package io.openbas.rest.team.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Set;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class TeamOutput {

  @JsonProperty("team_id")
  @NotBlank
  private String id;

  @JsonProperty("team_name")
  @NotBlank
  private String name;

  @JsonProperty("team_description")
  private String description;

  @Schema(description = "exercise ids")
  @JsonProperty("team_exercises")
  @NotBlank
  private Set<String> exercises;

  @Schema(description = "scenario ids")
  @JsonProperty("team_scenarios")
  @NotBlank
  private Set<String> scenarios;

  @JsonProperty("team_contextual")
  private Boolean contextual;

  @JsonProperty("team_tags")
  private Set<String> tags;

  @Schema(description = "user ids")
  @JsonProperty("team_users")
  private Set<String> users;

  @JsonProperty("team_organization")
  private String organization;

  @JsonProperty("team_updated_at")
  @NotNull
  private Instant updatedAt;

  @JsonProperty("team_users_number")
  public long getUsersNumber() {
    return getUsers().size();
  }
}
