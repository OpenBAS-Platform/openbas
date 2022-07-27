package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Objects;

public class ExecutionTrace {

    @JsonProperty("trace_identifier")
    private String identifier;

    @JsonProperty("trace_message")
    private String message;

    @JsonProperty("trace_status")
    private ExecutionStatus status;

    @JsonProperty("trace_time")
    private Instant traceTime;

    @JsonIgnore
    private Exception exception;

    @SuppressWarnings("unused")
    public ExecutionTrace() {
        // Default constructor for serialization
    }

    public ExecutionTrace(ExecutionStatus status, String identifier, String message, Exception e) {
        this.status = status;
        this.message = message;
        this.identifier = identifier;
        this.traceTime = Instant.now();
        this.exception = e;
    }

    public static ExecutionTrace traceSuccess(String identifier, String message) {
        return new ExecutionTrace(ExecutionStatus.SUCCESS, identifier, message, null);
    }

    public static ExecutionTrace traceError(String identifier, String message, Exception e) {
        return new ExecutionTrace(ExecutionStatus.ERROR, identifier, message, e);
    }

    public static ExecutionTrace traceError(String identifier, String message) {
        return new ExecutionTrace(ExecutionStatus.ERROR, identifier, message, null);
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public ExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(ExecutionStatus status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getTraceTime() {
        return traceTime;
    }

    public void setTraceTime(Instant traceTime) {
        this.traceTime = traceTime;
    }

    public Exception getException() {
        return exception;
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
