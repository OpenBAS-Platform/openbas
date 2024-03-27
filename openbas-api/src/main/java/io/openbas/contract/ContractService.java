package io.openbas.contract;

import io.openbas.database.model.Inject;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationRuntime;

@Getter
@Service
public class ContractService {

  private static final Logger LOGGER = Logger.getLogger(ContractService.class.getName());


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
            .filter(Objects::nonNull)
            .distinct()
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


  /**
   * Retrieves a paginated list of contracts.
   *
   * @param searchPaginationInput Criteria for searching contracts.
   * @return a {@link Page} containing the contracts for the requested page
   */
  public Page<Contract> searchContracts(SearchPaginationInput searchPaginationInput) {
    List<Contract> contractsExposed = getContracts().values()
        .stream()
        .filter(contract -> contract.getConfig().isExpose())
        .toList();
    return buildPaginationRuntime(contractsExposed, searchPaginationInput);
  }

}
