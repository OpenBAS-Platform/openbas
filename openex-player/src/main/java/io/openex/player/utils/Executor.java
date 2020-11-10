package io.openex.player.utils;

import io.openex.player.model.execution.Execution;
import io.openex.player.model.execution.ExecutionStatus;

public interface Executor<T> {
    void process(T inject, Execution execution) throws Exception;

    default Execution execute(T inject) {
        Execution execution = new Execution();
        try {
            process(inject, execution);
        } catch (Exception e) {
            execution.setStatus(ExecutionStatus.ERROR);
            execution.addMessage(e.getMessage());
        }
        return execution;
    }
}
