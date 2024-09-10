package io.openbas.rest.inject.output;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.InjectorContract;
import io.openbas.helper.InjectModelHelper;
import io.openbas.injectors.email.EmailContract;
import io.openbas.injectors.ovh.OvhSmsContract;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.*;

@Data
public class InjectOutput {

  @JsonProperty("inject_id")
  @NotBlank
  private String id;

  @JsonProperty("inject_title")
  @NotBlank
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

  @JsonProperty("inject_depends_on")
  private String dependsOn;

  @JsonProperty("inject_injector_contract")
  private InjectorContract injectorContract;

  @JsonProperty("inject_tags")
  private Set<String> tags;

  @JsonProperty("inject_ready")
  public boolean isReady;

  @JsonProperty("inject_type")
  public String injectType;

  @JsonProperty("inject_teams")
  private List<String> teams;

  @JsonProperty("inject_assets")
  private List<String> assets;

  @JsonProperty("inject_asset_groups")
  private List<String> assetGroups;

  @JsonProperty("inject_content")
  private ObjectNode content;

  @JsonProperty("inject_testable")
  public boolean canBeTested() {
    return EmailContract.TYPE.equals(this.getInjectType()) || OvhSmsContract.TYPE.equals(this.getInjectType());
  }

  public InjectOutput(
      String id,
      String title,
      boolean enabled,
      ObjectNode content,
      boolean allTeams,
      String exerciseId,
      String scenarioId,
      Long dependsDuration,
      String dependsOn,
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
    this.dependsOn = dependsOn;
    this.injectorContract = injectorContract;
    this.tags = tags != null ? new HashSet<>(Arrays.asList(tags)) : new HashSet<>();

    this.teams = teams != null ? new ArrayList<>(Arrays.asList(teams)) : new ArrayList<>();
    this.assets = assets != null ? new ArrayList<>(Arrays.asList(assets)) : new ArrayList<>();
    this.assetGroups = assetGroups != null ? new ArrayList<>(Arrays.asList(assetGroups)) : new ArrayList<>();

    this.isReady = InjectModelHelper.isReady(
        injectorContract,
        content,
        allTeams,
        this.teams,
        this.assets,
        this.assetGroups
    );
    this.injectType = injectType;
    this.teams = teams != null ? new ArrayList<>(Arrays.asList(teams)) : new ArrayList<>();
    this.content = content;
  }
}
