package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.utils.InjectMapper.ExpectationResultsByType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class InjectResultOutput {

  @Schema(description = "Id")
  @JsonProperty("inject_id")
  @NotNull
  private String id;

  @Schema(description = "Title")
  @JsonProperty("inject_title")
  @NotNull
  private String title;

  @JsonProperty("inject_updated_at")
  private Instant updatedAt;

  @JsonProperty("inject_type")
  private String type;

  @JsonProperty("inject_status")
  private InjectStatusSimple status;

  @Schema(description = "Full contract")
  @JsonProperty("inject_injector_contract")
  @NotNull
  private InjectorContractSimple injectorContract;

  @Schema(description = "Kill Chain Phases")
  @JsonProperty("inject_kill_chain_phases")
  @NotNull
  private List<KillChainPhaseSimple> killChainPhases;

  @JsonProperty("injects_tags")
  private List<String> tagIds;

  // -- PROCESSED PROPERTIES
  @Schema(
      description = "Specifies the categories of targets for atomic testing.",
      example = "assets, asset groups, teams, players")
  @JsonProperty("inject_targets")
  @NotNull
  private List<TargetSimple> targets;

  @Default
  @Schema(description = "Result of expectations")
  @JsonProperty("inject_expectation_results")
  @NotNull
  private List<ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();
}
