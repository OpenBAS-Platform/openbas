package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ExecutionTraceAction;
import io.openbas.database.model.ExecutionTraceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Represents a single execution trace detail")
public class ExecutionTracesOutput {
  @NotNull
  @JsonProperty("execution_status")
  @Schema(
      description = "The status of the execution trace",
      example = "SUCCESS, ERROR, COMMAND_NOT_FOUND, WARNING, COMMAND_CANNOT_BE_EXECUTED..")
  private ExecutionTraceStatus status;

  @NotNull
  @JsonProperty("execution_time")
  private Instant time;

  @NotNull
  @JsonProperty("execution_message")
  @Schema(description = "A detailed message describing the execution")
  private String message;

  @NotNull
  @JsonProperty("execution_action")
  @Schema(
      description = "The action that created this execution trace",
      example =
          "START, PREREQUISITE_CHECK, PREREQUISITE_EXECUTION, EXECUTION, CLEANUP_EXECUTION or COMPLETE")
  private ExecutionTraceAction action;
}
