package io.openbas.rest.inject.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.InjectorContract;
import io.openbas.helper.InjectModelHelper;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Data
public class InjectOutput {

  @JsonProperty("inject_id")
  @NotBlank
  private String id;

  @JsonProperty("inject_title")
  private String title;

  @JsonProperty("inject_enabled")
  private boolean enabled;

  @JsonProperty("inject_exercise")
  private String exercise;

  @JsonProperty("inject_scenario")
  private String scenario;

  @JsonProperty("inject_depends_duration")
  @NotNull
  @Min(value = 0L, message = "The value must be positive")
  private Long dependsDuration;

  @JsonProperty("inject_injector_contract")
  private InjectorContract injectorContract;

  @JsonProperty("inject_tags")
  private Set<String> tags;

  @JsonProperty("inject_ready")
  public boolean isReady;

  @JsonProperty("inject_type")
  public String injectType;

  public InjectOutput(
      String id,
      String title,
      boolean enabled,
      ObjectNode content,
      boolean allTeams,
      String exerciseId,
      String scenarioId,
      Long dependsDuration,
      InjectorContract injectorContract,
      String[] tags,
      String[] teams,
      String[] assets,
      String[] assetGroups,
      String injectType) {
    this.id = id;
    this.title = title;
    this.enabled = enabled;
    this.exercise = exerciseId;
    this.scenario = scenarioId;
    this.dependsDuration = dependsDuration;
    this.injectorContract = injectorContract;
    this.tags = tags != null ? new HashSet<>(Arrays.asList(tags)) : new HashSet<>();
    this.isReady = InjectModelHelper.isReady(
        injectorContract,
        content,
        allTeams,
        teams != null ? new HashSet<>(Arrays.asList(teams)) : new HashSet<>(),
        assets != null ? new HashSet<>(Arrays.asList(assets)) : new HashSet<>(),
        assetGroups != null ? new HashSet<>(Arrays.asList(assetGroups)) : new HashSet<>()
    );
    this.injectType = injectType;
  }
}
