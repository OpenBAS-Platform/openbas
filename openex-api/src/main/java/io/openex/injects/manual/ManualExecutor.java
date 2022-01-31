package io.openex.injects.manual;

import io.openex.execution.BasicExecutor;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.injects.manual.model.ManualInject;
import org.springframework.stereotype.Component;

@Component
public class ManualExecutor extends BasicExecutor<ManualInject> {

    @Override
    public void process(ExecutableInject<ManualInject> injection, Execution execution) {
        throw new UnsupportedOperationException("Manual inject cannot be executed");
    }
}
