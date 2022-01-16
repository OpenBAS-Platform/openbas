package io.openex.execution;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.time.Instant.now;

public class Execution {

    private static final Logger LOGGER = Logger.getLogger(Execution.class.getName());

    @JsonProperty("execution_stop")
    private Instant stopTime;

    @JsonProperty("execution_start")
    private Instant startTime;

    @JsonProperty("execution_traces")
    private List<ExecutionTrace> traces = new ArrayList<>();

    public Execution() {
        this.startTime = now();
    }

    public void stop() {
        this.stopTime = now();
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

    public Instant getStopTime() {
        return stopTime;
    }

    public void setStopTime(Instant stopTime) {
        this.stopTime = stopTime;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public List<ExecutionTrace> getTraces() {
        return traces;
    }

    public void setTraces(List<ExecutionTrace> traces) {
        this.traces = traces;
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
