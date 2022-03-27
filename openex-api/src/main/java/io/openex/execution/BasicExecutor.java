package io.openex.execution;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openex.database.model.Inject;
import io.openex.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;

import javax.annotation.Resource;

public abstract class BasicExecutor implements Executor {

    @Resource
    protected ObjectMapper mapper;

    private ContractService contractService;

    @Autowired
    public void setContractService(ContractService contractService) {
        this.contractService = contractService;
    }

    public ContractService getContractService() {
        return contractService;
    }

    public <T> T contentConvert(ExecutableInject injection, Class<T> converter) throws Exception {
        Inject inject = injection.getInject();
        ObjectNode content = inject.getContent();
        return mapper.treeToValue(content, converter);
    }
}
