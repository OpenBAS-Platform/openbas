package io.openex.player.injects.manual;

import io.openex.player.model.execution.Execution;
import io.openex.player.utils.Executor;
import org.springframework.stereotype.Component;

@Component
public class ManualExecutor implements Executor<ManualInject> {

    @Override
    public void process(ManualInject inject, Execution execution) throws Exception {
       System.out.println("Executing manual inject, just validating...");
    }
}
