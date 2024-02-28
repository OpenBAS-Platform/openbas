package io.openbas.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
public class ExecutionTrace {

    @JsonProperty("trace_identifier")
    private String identifier;

    @JsonProperty("trace_users")
    private List<String> userIds = new ArrayList<>();

    @Setter
    @JsonProperty("trace_message")
    private String message;

    @Setter
    @JsonProperty("trace_status")
    private ExecutionStatus status;

    @Setter
    @JsonProperty("trace_time")
    private Instant traceTime;

    @JsonIgnore
    private Exception exception;

    @SuppressWarnings("unused")
    public ExecutionTrace() {
        // Default constructor for serialization
    }

    public ExecutionTrace(ExecutionStatus status, String identifier, List<String> userIds, String message, Exception e) {
        this.status = status;
        this.userIds = userIds;
        this.message = message;
        this.identifier = identifier;
        this.traceTime = Instant.now();
        this.exception = e;
    }

    public static ExecutionTrace traceInfo(String identifier, String message) {
        return new ExecutionTrace(ExecutionStatus.INFO, identifier, List.of(), message, null);
    }

    public static ExecutionTrace traceSuccess(String identifier, String message) {
        return new ExecutionTrace(ExecutionStatus.SUCCESS, identifier, List.of(), message, null);
    }

    public static ExecutionTrace traceSuccess(String identifier, String message, List<String> userIds) {
        return new ExecutionTrace(ExecutionStatus.SUCCESS, identifier, userIds, message, null);
    }

    public static ExecutionTrace traceError(String identifier, String message, Exception e) {
        return new ExecutionTrace(ExecutionStatus.ERROR, identifier, List.of(), message, e);
    }

    public static ExecutionTrace traceError(String identifier, String message) {
        return new ExecutionTrace(ExecutionStatus.ERROR, identifier, List.of(), message, null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ExecutionTrace that = (ExecutionTrace) o;
        return Objects.equals(identifier, that.identifier)
                && message.equals(that.message)
                && status == that.status && traceTime.equals(that.traceTime);
    }

    @Override
    public int hashCode() {
        return Objects.hash(identifier, message, status, traceTime);
    }

    @Override
    public String toString() {
        return message + ": " + status;
    }
}
