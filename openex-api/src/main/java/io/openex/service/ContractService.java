package io.openex.service;

import io.openex.contract.Contract;
import io.openex.database.model.Inject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private List<Contract> contracts;

    @Autowired
    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
    }

    public List<Contract> getContracts() {
        return contracts;
    }

    public boolean isInjectContractEnable(Inject inject) {
        Map<String, Contract> contractMap = contracts.stream()
                .collect(Collectors.toMap(Contract::getType, Function.identity()));
        Optional<Contract> injectContract = Optional.ofNullable(contractMap.get(inject.getType()));
        return injectContract.map(Contract::isExpose).orElse(false);
    }
}
