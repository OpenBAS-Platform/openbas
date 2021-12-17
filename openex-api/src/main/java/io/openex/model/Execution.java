package io.openex.model;

import io.openex.database.model.StatusReporting;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Execution {
    private final long startTime;
    private ExecutionStatus status;
    private List<String> messages = new ArrayList<>();

    public Execution() {
        this.status = ExecutionStatus.SUCCESS;
        this.startTime = new Date().getTime();
    }

    public void addMessage(String mess) {
        messages.add(mess);
    }

    public Integer getExecution() {
        return (int) (new Date().getTime() - this.startTime);
    }

    public ExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(ExecutionStatus status) {
        this.status = status;
    }

    public StatusReporting getReporting() {
        return new StatusReporting(messages);
    }

    public void setMessage(List<String> messages) {
        this.messages = messages;
    }
}
