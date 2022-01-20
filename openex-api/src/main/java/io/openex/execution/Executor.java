package io.openex.execution;

import static io.openex.execution.ExecutionTrace.traceError;

public interface Executor<T> {
    void process(ExecutableInject<T> inject, Execution execution);

    default Execution execute(ExecutableInject<T> inject) {
        Execution execution = new Execution();
        try {
            if (inject.getUsers().size() == 0) {
                throw new UnsupportedOperationException("Inject need at least one user");
            }
            process(inject, execution);
        } catch (Exception e) {
            execution.addTrace(traceError(getClass().getSimpleName(), e.getMessage(), e));
        } finally {
            execution.stop();
        }
        return execution;
    }
}
