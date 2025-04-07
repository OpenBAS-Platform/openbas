package io.openbas.rest.finding.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ContractOutputType;
import io.openbas.rest.asset.endpoint.form.EndpointSimple;
import io.openbas.rest.asset_group.form.AssetGroupOutput;
import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.rest.inject.output.InjectSimple;
import io.openbas.rest.scenario.form.ScenarioSimple;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.Set;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FindingOutput {

  @JsonProperty("finding_id")
  @NotBlank
  private String id;

  @JsonProperty("finding_field")
  @NotBlank
  private String field;

  @JsonProperty("finding_type")
  @NotNull
  protected ContractOutputType type;

  @JsonProperty("finding_value")
  @NotBlank
  protected String value;

  @JsonProperty("finding_name")
  @NotBlank
  protected String name;

  @JsonProperty("finding_created_at")
  @NotNull
  private Instant creationDate;

  @JsonProperty("finding_tags")
  private Set<String> tagIds;

  @JsonProperty("finding_inject")
  private InjectSimple inject;

  @JsonProperty("finding_simulation")
  private ExerciseSimple simulation;

  @JsonProperty("finding_scenario")
  private ScenarioSimple scenario;

  @JsonProperty("finding_assets")
  private Set<EndpointSimple> endpoints;

  @JsonProperty("finding_asset_groups")
  private Set<AssetGroupOutput> assetGroups;
}
