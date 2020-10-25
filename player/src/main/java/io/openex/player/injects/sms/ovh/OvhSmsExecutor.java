package io.openex.player.injects.sms.ovh;

import io.openex.player.model.execution.Execution;
import io.openex.player.utils.Executor;
import org.springframework.stereotype.Component;

@Component
public class OvhSmsExecutor implements Executor<OvhSmsInject> {

    @Override
    public void process(OvhSmsInject inject, Execution execution) throws Exception {
        String message = inject.getMessage();
        execution.addMessage("EXECUTING OVH SMS DATA" + message);
        System.out.println("EXECUTING OVH SMS DATA" + message);
    }
}
