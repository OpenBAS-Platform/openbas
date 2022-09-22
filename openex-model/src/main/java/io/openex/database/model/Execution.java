package io.openex.database.model;

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

    @JsonProperty("execution_start")
    private Instant startTime;

    @JsonProperty("execution_stop")
    private Instant stopTime;

    @JsonProperty("execution_async_id")
    private String asyncId;

    @JsonProperty("execution_traces")
    private List<ExecutionTrace> traces = new ArrayList<>();

    public Execution() {
        this.startTime = now();
    }

    public void stop() {
        this.stopTime = now();
    }

    public boolean isSynchronous() {
        return asyncId == null;
    }

    public static Execution executionError(String identifier, String message) {
        Execution execution = new Execution();
        execution.addTrace(traceError(identifier, message, null));
        execution.stop();
        return execution;
    }

    public void addTrace(ExecutionTrace context) {
        if (context.getStatus().equals(ExecutionStatus.SUCCESS)) {
            LOGGER.log(Level.INFO, context.getMessage());
        } else {
            LOGGER.log(Level.SEVERE, context.getMessage(), context.getException());
        }
        this.traces.add(context);
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
