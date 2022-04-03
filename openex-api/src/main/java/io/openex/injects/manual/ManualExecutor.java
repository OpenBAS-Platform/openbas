package io.openex.injects.manual;

import io.openex.contract.Contract;
import io.openex.execution.Injector;
import io.openex.execution.ExecutableInject;
import io.openex.database.model.Execution;
import org.springframework.stereotype.Component;

@Component("openex_manual")
public class ManualExecutor extends Injector {

    @Override
    public void process(Execution execution, ExecutableInject injection, Contract contract) throws Exception {
        throw new UnsupportedOperationException("Manual inject cannot be executed");
    }
}
