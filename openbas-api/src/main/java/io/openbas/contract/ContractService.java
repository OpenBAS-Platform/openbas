package io.openbas.contract;

import io.openbas.database.model.Inject;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

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
