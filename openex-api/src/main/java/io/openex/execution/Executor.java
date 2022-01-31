package io.openex.execution;

import io.openex.database.model.Inject;
import io.openex.database.model.Injection;
import io.openex.service.ContractService;

import java.time.Duration;
import java.time.Instant;

import static io.openex.execution.ExecutionTrace.traceError;

public interface Executor<T extends Inject> {
    void process(ExecutableInject<T> inject, Execution execution);

    ContractService getContractService();

    private boolean isInInjectableRange(Injection injection) {
        Instant now = Instant.now();
        Instant start = now.minus(Duration.parse("PT1H"));
        Instant injectWhen = injection.getDate().orElseThrow();
        return injectWhen.isAfter(start) && injectWhen.isBefore(now);
    }

    private Execution execute(ExecutableInject<?> executableInject, boolean checkDateRange) {
        Execution execution = new Execution();
        ContractService contractService = getContractService();
        try {
            if (executableInject.getUsers().size() == 0) {
                throw new UnsupportedOperationException("Inject need at least one user");
            }
            if (checkDateRange && !isInInjectableRange(executableInject.getSource())) {
                throw new UnsupportedOperationException("Inject is now too old for execution");
            }
            if (contractService == null || !contractService.isInjectContractEnable(executableInject.getInject())) {
                throw new UnsupportedOperationException("Inject is not supported for execution");
            }
            //noinspection unchecked
            process((ExecutableInject<T>) executableInject, execution);
        } catch (Exception e) {
            execution.addTrace(traceError(getClass().getSimpleName(), e.getMessage(), e));
        } finally {
            execution.stop();
        }
        return execution;
    }

    default Execution executeInRange(ExecutableInject<?> executableInject) {
        return execute(executableInject, true);
    }

    default Execution executeDirectly(ExecutableInject<?> executableInject) {
        return execute(executableInject, false);
    }
}
