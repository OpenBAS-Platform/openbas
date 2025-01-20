package io.openbas.rest.team.form;

import static io.openbas.config.AppConfig.MANDATORY_MESSAGE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class TeamCreateInput {

  @NotBlank(message = MANDATORY_MESSAGE)
  @JsonProperty("team_name")
  @Schema(description = "Name of the team")
  private String name;

  @JsonProperty("team_description")
  @Schema(description = "Description of the team")
  private String description;

  @JsonProperty("team_organization")
  @Schema(description = "Organization of the team")
  private String organizationId;

  @JsonProperty("team_tags")
  @Schema(description = "Id of the tags linked to the team")
  private List<String> tagIds = new ArrayList<>();

  @JsonProperty("team_exercises")
  @Schema(description = "Id of the simulations linked to the team")
  private List<String> exerciseIds = new ArrayList<>();

  @JsonProperty("team_scenarios")
  @Schema(description = "Id of the scenarios linked to the team")
  private List<String> scenarioIds = new ArrayList<>();

  @JsonProperty("team_contextual")
  @Schema(
      description =
          "True if the team is contextual (exists only in the scenario/simulation it is linked to)")
  private Boolean contextual = false;
}
