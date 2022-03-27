package io.openex.service;

import io.openex.contract.BaseContract;
import io.openex.contract.ContractInstance;
import io.openex.database.model.Inject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private static final Logger LOGGER = Logger.getLogger(ContractService.class.getName());
    private final Map<String, ContractInstance> contracts = new HashMap<>();
    private List<BaseContract> baseContracts;

    @Autowired
    public void setBaseContracts(List<BaseContract> baseContracts) {
        this.baseContracts = baseContracts;
    }

    // You build the contracts every minute
    @Scheduled(fixedDelay = 60000, initialDelay = 0)
    public void buildContracts() {
        baseContracts.forEach(baseContract -> {
            try {
                Map<String, ContractInstance> contractInstances = baseContract.generateContracts()
                        .stream().collect(Collectors.toMap(ContractInstance::getId, Function.identity()));
                contracts.putAll(contractInstances);
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, e.getMessage(), e);
            }
        });
    }

    public Map<String, ContractInstance> getContracts() {
        return contracts;
    }

    public String getContractType(String contractId) {
        return contracts.get(contractId).getType();
    }

    public boolean isInjectContractEnable(Inject inject) {
        ContractInstance contract = contracts.get(inject.getContract());
        return contract.isExpose();
    }
}
