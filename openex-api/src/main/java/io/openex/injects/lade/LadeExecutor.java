package io.openex.injects.lade;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openex.contract.ContractInstance;
import io.openex.database.model.Inject;
import io.openex.execution.BasicExecutor;
import io.openex.execution.ExecutableInject;
import io.openex.execution.Execution;
import io.openex.injects.lade.service.LadeService;
import io.openex.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static io.openex.execution.ExecutionTrace.traceError;
import static io.openex.execution.ExecutionTrace.traceSuccess;

@Component("openex_lade")
public class LadeExecutor extends BasicExecutor {

    private LadeService ladeService;

    @Autowired
    public void setLadeService(LadeService ladeService) {
        this.ladeService = ladeService;
    }

    @Override
    public void process(ExecutableInject injection, Execution execution) throws Exception {
        Inject inject = injection.getInject();
        ContractInstance contractInstance = getContractService().getContracts().get(inject.getContract());
        String bundleIdentifier = contractInstance.getContext().get("bundle_identifier");
        ObjectNode content = inject.getContent();
        try {
            String callResult = ladeService.executeAction(bundleIdentifier, inject.getContract(), content);
            String message = "Lade action sent with workflow (" + callResult + ")";
            execution.addTrace(traceSuccess("lade", message));
        } catch (Exception e) {
            execution.addTrace(traceError("lade", e.getMessage(), e));
        }
    }
}
