package io.openex.model;

public interface Executor<T> {
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
