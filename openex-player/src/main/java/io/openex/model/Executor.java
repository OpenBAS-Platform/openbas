package io.openex.model;

public interface Executor<T> {
    void process(ExecutableInject<T> inject, Execution execution);

    default Execution execute(ExecutableInject<T> inject) {
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
