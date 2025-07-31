package io.openbas.rest.injector_contract;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;

import io.openbas.database.model.InjectorContract;
import io.openbas.database.raw.RawInjectorsContrats;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.injector_contract.form.InjectorContractAddInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateMappingInput;
import io.openbas.rest.injector_contract.output.InjectorContractOutput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
public class InjectorContractApi extends RestBehavior {

  public static final String INJECTOR_CONTRACT_URL = "/api/injector_contracts";

  private final InjectorContractService injectorContractService;

  @GetMapping(INJECTOR_CONTRACT_URL)
  public Iterable<RawInjectorsContrats> injectContracts() {
    return injectorContractService.getAllRawInjectContracts();
  }

  @PostMapping(INJECTOR_CONTRACT_URL + "/search")
  public Page<InjectorContractOutput> injectorContracts(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationCriteriaBuilder(
        this.injectorContractService::injectorContracts,
        handleArchitectureFilter(searchPaginationInput),
        InjectorContract.class);
  }

  @Secured(ROLE_ADMIN)
  @GetMapping(INJECTOR_CONTRACT_URL + "/{injectorContractId}")
  public InjectorContract injectorContract(@PathVariable String injectorContractId) {
    return injectorContractService.getSingleInjectorContract(injectorContractId);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(INJECTOR_CONTRACT_URL)
  public InjectorContract createInjectorContract(
      @Valid @RequestBody InjectorContractAddInput input) {
    return injectorContractService.createNewInjectorContract(input);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(INJECTOR_CONTRACT_URL + "/{injectorContractId}")
  public InjectorContract updateInjectorContract(
      @PathVariable String injectorContractId,
      @Valid @RequestBody InjectorContractUpdateInput input) {
    return injectorContractService.updateInjectorContract(injectorContractId, input);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(INJECTOR_CONTRACT_URL + "/{injectorContractId}/mapping")
  public InjectorContract updateInjectorContractMapping(
      @PathVariable String injectorContractId,
      @Valid @RequestBody InjectorContractUpdateMappingInput input) {
    return injectorContractService.updateAttackPatternMappings(injectorContractId, input);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(INJECTOR_CONTRACT_URL + "/{injectorContractId}")
  public void deleteInjectorContract(@PathVariable String injectorContractId) {
    this.injectorContractService.deleteInjectorContract(injectorContractId);
  }
}
