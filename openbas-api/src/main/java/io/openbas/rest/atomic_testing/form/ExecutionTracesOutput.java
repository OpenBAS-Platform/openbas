package io.openbas.rest.atomic_testing.form;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.openbas.database.model.ExecutionTraceAction;
import io.openbas.database.model.ExecutionTraceStatus;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import lombok.Builder;

@Builder
public class ExecutionTracesOutput {
  @NotNull
  @JsonProperty("execution_status")
  private ExecutionTraceStatus status;

  @NotNull
  @JsonProperty("execution_time")
  private Instant time;

  @NotNull
  @JsonProperty("execution_message")
  private String message;

  @NotNull
  @JsonProperty("execution_action")
  private ExecutionTraceAction action;
}
