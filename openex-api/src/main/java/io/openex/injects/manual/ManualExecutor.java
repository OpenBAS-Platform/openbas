package io.openex.injects.manual;

import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.execution.Executor;
import io.openex.injects.manual.model.ManualInject;
import org.springframework.stereotype.Component;

@Component
public class ManualExecutor implements Executor<ManualInject> {

    @Override
    public void process(ExecutableInject<ManualInject> injection, Execution execution) {
        throw new UnsupportedOperationException("Manual inject cannot be executed");
    }
}
