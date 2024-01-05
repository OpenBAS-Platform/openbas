package io.openex.service;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.contract.Contractor;
import io.openex.database.model.Inject;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ContractService {

  private static final Logger LOGGER = Logger.getLogger(ContractService.class.getName());
  @Getter
  private final Map<String, Contract> contracts = new HashMap<>();
  private List<Contractor> baseContracts;

  @Autowired
  public void setBaseContracts(List<Contractor> baseContracts) {
    this.baseContracts = baseContracts;
  }

  // Build the contracts every minute
  @Scheduled(fixedDelay = 60000, initialDelay = 0)
  public void buildContracts() {
    this.baseContracts.stream().parallel().forEach(helper -> {
      try {
        Map<String, Contract> contractInstances = helper.contracts()
            .stream()
            .collect(Collectors.toMap(Contract::getId, Function.identity()));
        this.contracts.putAll(contractInstances);
      } catch (Exception e) {
        LOGGER.log(Level.SEVERE, e.getMessage(), e);
      }
    });
  }

  public Contract contract(@NotNull final String contractId) {
    return this.contracts.get(contractId);
  }

  public List<ContractConfig> getContractConfigs() {
    return this.contracts.values()
        .stream()
        .map(Contract::getConfig)
        .distinct()
        .toList();
  }

  public String getContractType(@NotNull final String contractId) {
    Contract contractInstance = this.contracts.get(contractId);
    return contractInstance != null ? contractInstance.getConfig().getType() : null;
  }

  public Contract resolveContract(Inject inject) {
    return this.contracts.get(inject.getContract());
  }
}
