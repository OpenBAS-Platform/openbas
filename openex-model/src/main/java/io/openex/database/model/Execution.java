package io.openex.database.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

import static io.openex.database.model.ExecutionTrace.traceError;
import static java.time.Instant.now;

public class Execution {

    private static final Logger LOGGER = Logger.getLogger(Execution.class.getName());

    @JsonProperty("execution_runtime")
    private boolean runtime;

    @JsonProperty("execution_start")
    private Instant startTime;

    @JsonProperty("execution_stop")
    private Instant stopTime;

    @JsonProperty("execution_async_id")
    private String asyncId;

    @JsonProperty("execution_traces")
    private List<ExecutionTrace> traces = new ArrayList<>();

    public Execution() {
        // Default constructor for serialization
    }

    public Execution(boolean runtime) {
        this.runtime = runtime;
        this.startTime = now();
    }

    @SuppressWarnings("unused")
    public void setRuntime(boolean runtime) {
        this.runtime = runtime;
    }

    public boolean isRuntime() {
        return runtime;
    }

    public void stop() {
        this.stopTime = now();
    }

    @JsonIgnore
    public boolean isSynchronous() {
        return asyncId == null;
    }

    public static Execution executionError(boolean runtime, String identifier, String message) {
        Execution execution = new Execution(runtime);
        execution.addTrace(traceError(identifier, message, null));
        execution.stop();
        return execution;
    }

    public void addTrace(ExecutionTrace context) {
        ExecutionStatus status = context.getStatus();
        if (status.equals(ExecutionStatus.SUCCESS) || status.equals(ExecutionStatus.INFO)) {
            LOGGER.log(Level.INFO, context.getMessage());
        } else {
            LOGGER.log(Level.SEVERE, context.getMessage(), context.getException());
        }
        this.traces.add(context);
    }

    public void setTraces(List<ExecutionTrace> traces) {
        this.traces = traces;
    }

    @JsonProperty("execution_time")
    public int getExecutionTime() {
        return (int) (this.stopTime.toEpochMilli() - this.startTime.toEpochMilli());
    }

    public ExecutionStatus getStatus() {
        boolean hasSuccess = traces.stream().anyMatch(context -> context.getStatus().equals(ExecutionStatus.SUCCESS));
        boolean hasError = traces.stream().anyMatch(context -> context.getStatus().equals(ExecutionStatus.ERROR));
        if (hasSuccess && hasError) {
            return ExecutionStatus.PARTIAL;
        } else {
            return hasSuccess ? ExecutionStatus.SUCCESS : ExecutionStatus.ERROR;
        }
    }

    public String getAsyncId() {
        return asyncId;
    }

    public void setAsyncId(String asyncId) {
        this.asyncId = asyncId;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public List<ExecutionTrace> getTraces() {
        return traces;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Execution execution = (Execution) o;
        return Objects.equals(stopTime, execution.stopTime)
                && startTime.equals(execution.startTime)
                && Objects.equals(traces, execution.traces);
    }

    @Override
    public int hashCode() {
        return Objects.hash(stopTime, startTime, traces);
    }
}
