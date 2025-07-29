package io.openbas.rest.injector_contract;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;

import io.openbas.database.model.InjectorContract;
import io.openbas.database.raw.RawInjectorsContrats;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.injector_contract.form.InjectorContractAddInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateMappingInput;
import io.openbas.rest.injector_contract.output.InjectorContractOutput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
public class InjectorContractApi extends RestBehavior {

  public static final String INJECTOR_CONTRACT_URL = "/api/injector_contracts";

  private final AttackPatternRepository attackPatternRepository;

  private final InjectorRepository injectorRepository;

  private final InjectorContractRepository injectorContractRepository;

  private final InjectorContractService injectorContractService;

  @GetMapping(INJECTOR_CONTRACT_URL)
  public Iterable<RawInjectorsContrats> injectContracts() {
    return injectorContractRepository.getAllRawInjectorsContracts();
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
    return injectorContractRepository
        .findById(injectorContractId)
        .orElseThrow(ElementNotFoundException::new);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(INJECTOR_CONTRACT_URL)
  @Transactional(rollbackOn = Exception.class)
  public InjectorContract createInjectorContract(
      @Valid @RequestBody InjectorContractAddInput input) {
    InjectorContract injectorContract = new InjectorContract();
    injectorContract.setCustom(true);
    injectorContract.setUpdateAttributes(input);
    if (!input.getAttackPatternsExternalIds().isEmpty()) {
      injectorContract.setAttackPatterns(
          fromIterable(
              attackPatternRepository.findAllByExternalIdInIgnoreCase(
                  input.getAttackPatternsExternalIds())));
    } else if (!input.getAttackPatternsIds().isEmpty()) {
      injectorContract.setAttackPatterns(
          fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    }
    injectorContract.setInjector(
        updateRelation(input.getInjectorId(), injectorContract.getInjector(), injectorRepository));
    return injectorContractRepository.save(injectorContract);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(INJECTOR_CONTRACT_URL + "/{injectorContractId}")
  public InjectorContract updateInjectorContract(
      @PathVariable String injectorContractId,
      @Valid @RequestBody InjectorContractUpdateInput input) {
    InjectorContract injectorContract =
        injectorContractRepository
            .findById(injectorContractId)
            .orElseThrow(ElementNotFoundException::new);
    injectorContract.setUpdateAttributes(input);
    injectorContract.setAttackPatterns(
        fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    injectorContract.setUpdatedAt(Instant.now());
    return injectorContractRepository.save(injectorContract);
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(INJECTOR_CONTRACT_URL + "/{injectorContractId}/mapping")
  public InjectorContract updateInjectorContractMapping(
      @PathVariable String injectorContractId,
      @Valid @RequestBody InjectorContractUpdateMappingInput input) {
    InjectorContract injectorContract =
        injectorContractRepository
            .findById(injectorContractId)
            .orElseThrow(ElementNotFoundException::new);
    injectorContract.setAttackPatterns(
        fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
    injectorContract.setUpdatedAt(Instant.now());
    return injectorContractRepository.save(injectorContract);
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(INJECTOR_CONTRACT_URL + "/{injectorContractId}")
  public void deleteInjectorContract(@PathVariable String injectorContractId) {
    this.injectorContractService.deleteInjectorContract(injectorContractId);
  }
}
