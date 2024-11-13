package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InjectStatusExecution {

  public static final String EXECUTION_TYPE_STANDARD = "standard";
  public static final String EXECUTION_TYPE_COMMAND = "command_line";

  @JsonProperty("execution_time")
  private Instant time;

  @JsonProperty("execution_duration")
  private int duration;

  @JsonProperty("execution_message")
  private String message;

  @JsonProperty("execution_category")
  private String category = "standard"; // standard / command_line / ??

  @JsonProperty("execution_status")
  private ExecutionTraceStatus status;

  @JsonProperty("execution_context_identifiers")
  private List<String> identifiers = new ArrayList<>();

  public InjectStatusExecution() {
    // Default constructor
  }

  public InjectStatusExecution(
      ExecutionTraceStatus status, List<String> identifiers, String message, String category) {
    this.status = status;
    this.identifiers = identifiers;
    this.message = message;
    this.time = Instant.now();
    this.category = category;
  }

  public static InjectStatusExecution traceInfo(String message) {
    return new InjectStatusExecution(
        ExecutionTraceStatus.INFO, List.of(), message, EXECUTION_TYPE_STANDARD);
  }

  public static InjectStatusExecution traceInfo(String category, String message) {
    return new InjectStatusExecution(ExecutionTraceStatus.INFO, List.of(), message, category);
  }

  public static InjectStatusExecution traceInfo(String message, List<String> identifiers) {
    return new InjectStatusExecution(
        ExecutionTraceStatus.INFO, identifiers, message, EXECUTION_TYPE_STANDARD);
  }

  public static InjectStatusExecution traceSuccess(String message) {
    return new InjectStatusExecution(
        ExecutionTraceStatus.SUCCESS, List.of(), message, EXECUTION_TYPE_STANDARD);
  }

  public static InjectStatusExecution traceSuccess(String message, List<String> userIds) {
    return new InjectStatusExecution(
        ExecutionTraceStatus.SUCCESS, userIds, message, EXECUTION_TYPE_STANDARD);
  }

  public static InjectStatusExecution traceError(String message) {
    return new InjectStatusExecution(
        ExecutionTraceStatus.ERROR, List.of(), message, EXECUTION_TYPE_STANDARD);
  }

  public static InjectStatusExecution traceError(ExecutionTraceStatus status, String message) {
    return new InjectStatusExecution(status, List.of(), message, EXECUTION_TYPE_STANDARD);
  }

  public static InjectStatusExecution traceMaybePrevented(String message) {
    return new InjectStatusExecution(
        ExecutionTraceStatus.MAYBE_PREVENTED, List.of(), message, EXECUTION_TYPE_STANDARD);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    InjectStatusExecution that = (InjectStatusExecution) o;
    return message.equals(that.message) && status == that.status && time.equals(that.time);
  }

  @Override
  public int hashCode() {
    return Objects.hash(message, status, time);
  }

  @Override
  public String toString() {
    return message + ": " + status;
  }
}
