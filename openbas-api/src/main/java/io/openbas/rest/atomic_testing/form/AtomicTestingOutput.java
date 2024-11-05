package io.openbas.rest.atomic_testing.form;

import static lombok.AccessLevel.NONE;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectorContract;
import io.openbas.utils.InjectMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.Data;
import lombok.Getter;

@Data
public class AtomicTestingOutput {

  @JsonProperty("inject_id")
  @NotBlank
  private String id;

  @JsonProperty("inject_title")
  @NotBlank
  private String title;

  @JsonProperty("inject_updated_at")
  @NotNull
  private Instant updatedAt;

  @JsonProperty("inject_type")
  public String injectType;

  @JsonProperty("inject_injector_contract")
  private InjectorContract injectorContract;

  @Getter(NONE)
  @JsonProperty("inject_status")
  private InjectStatusSimple status;

  public InjectStatusSimple getStatus() {
    if (status == null) {
      return InjectStatusSimple.builder().name(ExecutionStatus.DRAFT.name()).build();
    }
    return status;
  }

  @JsonProperty("inject_teams")
  @NotNull
  private List<String> teams;

  @JsonProperty("inject_assets")
  @NotNull
  private List<String> assets;

  @JsonProperty("inject_asset_groups")
  @NotNull
  private List<String> assetGroups;

  @JsonProperty("inject_expectations")
  @NotNull
  private List<String> expectations;

  @JsonProperty("inject_targets")
  private List<TargetSimple> targets = new ArrayList<>();

  // Pre Calcul

  @JsonProperty("inject_expectation_results")
  private List<InjectMapper.ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

  public AtomicTestingOutput(
      String id,
      String title,
      Instant updatedAt,
      String injectType,
      InjectorContract injectorContract,
      InjectStatusSimple injectStatus,
      String[] injectExpectations,
      String[] teams,
      String[] assets,
      String[] assetGroups) {
    this.id = id;
    this.title = title;
    this.updatedAt = updatedAt;
    this.injectType = injectType;
    this.injectorContract = injectorContract;
    this.status = injectStatus;
    this.expectations =
        injectExpectations != null
            ? new ArrayList<>(Arrays.asList(injectExpectations))
            : new ArrayList<>();

    this.teams = teams != null ? new ArrayList<>(Arrays.asList(teams)) : new ArrayList<>();
    this.assets = assets != null ? new ArrayList<>(Arrays.asList(assets)) : new ArrayList<>();
    this.assetGroups =
        assetGroups != null ? new ArrayList<>(Arrays.asList(assetGroups)) : new ArrayList<>();
  }
}
