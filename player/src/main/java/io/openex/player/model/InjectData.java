package io.openex.player.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class InjectData {
    public abstract void process(Execution execution);

    public Execution execute() {
        Execution execution = new Execution();
        try {
            process(execution);
        } catch (Exception e) {
            execution.setStatus(ExecutionStatus.ERROR);
            execution.addMessage(e.getMessage());
        }
        return execution;
    }
}
