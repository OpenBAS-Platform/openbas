package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.AttackPattern;
import io.openbas.database.model.KillChainPhase;
import io.openbas.utils.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.InjectorContract;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Builder.Default;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Builder
public class AtomicTestingOutput {

  @Schema(description = "Id")
  @JsonProperty("atomic_id")
  @NotNull
  private String id;

  @Schema(description = "Title")
  @JsonProperty("atomic_title")
  @NotNull
  private String title;

  @Schema(description = "Description")
  @JsonProperty("atomic_description")
  @NotNull
  private String description;

  @Schema(description = "Type")
  @JsonProperty("atomic_type")
  @NotNull
  private String type;

  @Schema(description = "Kill Chain Phases")
  @JsonProperty("atomic_kill_chain_phases")
  @NotNull
  private List<KillChainPhase> killChainPhases;

  @Schema(description = "Attack Patterns")
  @JsonProperty("atomic_attack_patterns")
  @NotNull
  private List<AttackPattern> attackPatterns;

  @Schema(description = "Full contract")
  @JsonProperty("atomic_injector_contract")
  @NotNull
  private InjectorContract injectorContract;

  @Schema(description = "Contract")
  @JsonProperty("atomic_contract")
  @NotNull
  private String contract;

  @Schema(description = "Last Execution Start date")
  @JsonProperty("atomic_last_execution_start_date")
  private Instant lastExecutionStartDate;

  @Schema(description = "Last Execution End date")
  @JsonProperty("atomic_last_execution_end_date")
  private Instant lastExecutionEndDate;

  @Schema(
      description = "Specifies the categories of targetResults for atomic testing.",
      example = "assets, asset groups, teams, players"
  )
  @JsonProperty("atomic_targets")
  @NotNull
  private List<InjectTargetWithResult> targets;

  @Schema(description = "Status of execution")
  @JsonProperty("atomic_status")
  @NotNull
  private ExecutionStatus status;

  @Default
  @Schema(description = "Result of expectations")
  @JsonProperty("atomic_expectation_results")
  @NotNull
  private List<ExpectationResultsByType> expectationResultByTypes = new ArrayList<>();

  @JsonProperty("atomic_tags")
  private List<String> tagIds = new ArrayList<>();
}
