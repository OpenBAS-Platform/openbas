package io.openbas.rest.injector_contract;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.ArchitectureFilterUtils.handleArchitectureFilter;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;

import io.openbas.aop.RBAC;
import io.openbas.database.model.Action;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.ResourceType;
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

  private final AttackPatternRepository attackPatternRepository;

  private final InjectorRepository injectorRepository;

  private final InjectorContractRepository injectorContractRepository;

  private final InjectorContractService injectorContractService;

  @GetMapping("/api/injector_contracts")
  @RBAC(requiredAction = Action.READ, resourceType = ResourceType.PLATFORM_SETTING)
  public Iterable<RawInjectorsContrats> injectContracts() {
    return injectorContractRepository.getAllRawInjectorsContracts();
  }

  @PostMapping("/api/injector_contracts/search")
  @RBAC(requiredAction = Action.SEARCH, resourceType = ResourceType.PLATFORM_SETTING)
  public Page<InjectorContractOutput> injectorContracts(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationCriteriaBuilder(
        this.injectorContractService::injectorContracts,
        handleArchitectureFilter(searchPaginationInput),
        InjectorContract.class);
  }

  @Secured(ROLE_ADMIN)
  @RBAC(
      resourceId = "#injectorContractId",
      requiredAction = Action.READ,
      resourceType = ResourceType.PLATFORM_SETTING)
  @GetMapping("/api/injector_contracts/{injectorContractId}")
  public InjectorContract injectorContract(@PathVariable String injectorContractId) {
    return injectorContractRepository
        .findById(injectorContractId)
        .orElseThrow(ElementNotFoundException::new);
  }

  @Secured(ROLE_ADMIN)
  @PostMapping("/api/injector_contracts")
  @RBAC(requiredAction = Action.WRITE, resourceType = ResourceType.PLATFORM_SETTING)
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
  @PutMapping("/api/injector_contracts/{injectorContractId}")
  @RBAC(
      resourceId = "#injectorContractId",
      requiredAction = Action.WRITE,
      resourceType = ResourceType.PLATFORM_SETTING)
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
  @PutMapping("/api/injector_contracts/{injectorContractId}/mapping")
  @RBAC(
      resourceId = "#injectorContractId",
      requiredAction = Action.WRITE,
      resourceType = ResourceType.PLATFORM_SETTING)
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
  @DeleteMapping("/api/injector_contracts/{injectorContractId}")
  @RBAC(
      resourceId = "#injectorContractId",
      requiredAction = Action.DELETE,
      resourceType = ResourceType.PLATFORM_SETTING)
  public void deleteInjectorContract(@PathVariable String injectorContractId) {
    this.injectorContractService.deleteInjectorContract(injectorContractId);
  }
}
