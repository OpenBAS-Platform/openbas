package io.openex.injects.manual;

import io.openex.execution.BasicExecutor;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import org.springframework.stereotype.Component;

@Component("openex_manual")
public class ManualExecutor extends BasicExecutor {

    @Override
    public void process(ExecutableInject injection, Execution execution) throws Exception {
        throw new UnsupportedOperationException("Manual inject cannot be executed");
    }
}
