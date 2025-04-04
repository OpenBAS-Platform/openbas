package io.openbas.rest.finding.form;

import static java.time.Instant.now;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ContractOutputType;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.rest.exercise.form.ExerciseSimple;
import io.openbas.rest.scenario.form.ScenarioSimple;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
  private Instant creationDate = now();

  @JsonProperty("finding_tags")
  private Set<String> tagIds = new HashSet<>();

  @JsonProperty("finding_scenarios")
  private Set<ScenarioSimple> scenarios = new HashSet<>();

  @JsonProperty("finding_simulations")
  private Set<ExerciseSimple> simulations = new HashSet<>();

  @JsonProperty("finding_assets")
  private Set<EndpointOutput> assetIds = new HashSet<>();
}
