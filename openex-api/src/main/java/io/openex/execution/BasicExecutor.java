package io.openex.execution;

import io.openex.database.model.Inject;
import io.openex.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class BasicExecutor<T extends Inject> implements Executor<T> {

    private ContractService contractService;

    @Autowired
    public void setContractService(ContractService contractService) {
        this.contractService = contractService;
    }

    public ContractService getContractService() {
        return contractService;
    }
}
