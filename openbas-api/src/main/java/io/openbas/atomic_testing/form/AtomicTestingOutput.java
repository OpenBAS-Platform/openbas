package io.openbas.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ExecutionStatus;
import io.openbas.atomic_testing.form.AtomicTestingMapper.ExpectationResultsByType;
import io.openbas.atomic_testing.form.AtomicTestingMapper.InjectTargetWithResult;
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
public class AtomicTestingOutput {

  @Schema(description = "Id")
  @JsonProperty("atomic_id")
  @NotNull
  private String id;

  @Schema(description = "Title")
  @JsonProperty("atomic_title")
  @NotNull
  private String title;

  @Schema(description = "Type")
  @JsonProperty("atomic_type")
  @NotNull
  private String type;

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
}
