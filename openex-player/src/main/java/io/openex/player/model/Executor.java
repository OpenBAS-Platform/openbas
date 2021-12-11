package io.openex.player.model;

import io.openex.player.model.execution.ExecutableInject;
import io.openex.player.model.execution.Execution;
import io.openex.player.model.execution.ExecutionStatus;
import io.openex.player.model.ContentBase;

public interface Executor<T extends ContentBase> {
    void process(ExecutableInject<T> inject, Execution execution) throws Exception;

    @SuppressWarnings("unchecked")
    default Execution execute(ExecutableInject<?> inject) {
        Execution execution = new Execution();
        try {
            process((ExecutableInject<T>)inject, execution);
        } catch (Exception e) {
            execution.setStatus(ExecutionStatus.ERROR);
            execution.addMessage(e.getMessage());
        }
        return execution;
    }
}
