package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
public class InjectStatusExecution {

    @JsonProperty("execution_time")
    private Instant time;

    @JsonProperty("execution_duration")
    private int duration;

    @JsonProperty("execution_message")
    private String message;

    @JsonProperty("execution_status")
    private ExecutionStatus status;

    @JsonProperty("execution_context_identifiers")
    private List<String> identifiers = new ArrayList<>();

    public InjectStatusExecution() {
        // Default constructor
    }

    public InjectStatusExecution(ExecutionStatus status, List<String> identifiers, String message) {
        this.status = status;
        this.identifiers = identifiers;
        this.message = message;
        this.time = Instant.now();
    }

    public static InjectStatusExecution traceInfo(String message) {
        return new InjectStatusExecution(ExecutionStatus.INFO, List.of(), message);
    }

    public static InjectStatusExecution traceInfo(String message, List<String> identifiers) {
        return new InjectStatusExecution(ExecutionStatus.INFO, identifiers, message);
    }

    public static InjectStatusExecution traceSuccess(String message) {
        return new InjectStatusExecution(ExecutionStatus.SUCCESS, List.of(), message);
    }

    public static InjectStatusExecution traceSuccess(String message, List<String> userIds) {
        return new InjectStatusExecution(ExecutionStatus.SUCCESS, userIds, message);
    }

    public static InjectStatusExecution traceError(String message) {
        return new InjectStatusExecution(ExecutionStatus.ERROR, List.of(), message);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InjectStatusExecution that = (InjectStatusExecution) o;
        return message.equals(that.message)
                && status == that.status && time.equals(that.time);
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
