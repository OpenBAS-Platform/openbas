package io.openbas.rest.injector_contract;

import io.openbas.database.model.Filters;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.raw.RawInjectorsContrats;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.database.specification.InjectorContractSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.injector_contract.form.InjectorContractAddInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateMappingInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RequiredArgsConstructor
@RestController
public class InjectorContractApi extends RestBehavior {

    private final AttackPatternRepository attackPatternRepository;

    private final InjectorRepository injectorRepository;

    private final InjectorContractRepository injectorContractRepository;

    @GetMapping("/api/injector_contracts")
    public Iterable<RawInjectorsContrats> injectContracts() {
        return injectorContractRepository.getAllRawInjectorsContracts();
    }

    @PostMapping("/api/injector_contracts/search")
    public Page<InjectorContract> injectorContracts(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        if( searchPaginationInput.getFilterGroup() != null && searchPaginationInput.getFilterGroup().getFilters() != null ) {
            List<Filters.Filter> killChainPhaseFilters = searchPaginationInput.getFilterGroup().getFilters().stream().filter(filter -> filter.getKey().equals("injector_contract_kill_chain_phases")).toList();
            if (!killChainPhaseFilters.isEmpty()) {
                Filters.Filter killChainPhaseFilter = killChainPhaseFilters.getFirst();
                if (!killChainPhaseFilter.getValues().isEmpty()) {
                    // Purge filter
                    SearchPaginationInput newSearchPaginationInput = new SearchPaginationInput();
                    newSearchPaginationInput.setTextSearch(searchPaginationInput.getTextSearch());
                    newSearchPaginationInput.setSize(searchPaginationInput.getSize());
                    newSearchPaginationInput.setSorts(searchPaginationInput.getSorts());
                    newSearchPaginationInput.setPage(searchPaginationInput.getPage());
                    Filters.FilterGroup newFilterGroup = new Filters.FilterGroup();
                    newFilterGroup.setFilters(searchPaginationInput.getFilterGroup().getFilters().stream().filter(filter -> !filter.getKey().equals("injector_contract_kill_chain_phases")).toList());
                    newSearchPaginationInput.setFilterGroup(newFilterGroup);
                    return buildPaginationJPA(
                            (Specification<InjectorContract> specification, Pageable pageable) -> this.injectorContractRepository.findAll(
                                    InjectorContractSpecification.fromKillChainPhase(killChainPhaseFilter.getValues().getFirst()).and(specification), pageable),
                            newSearchPaginationInput,
                            InjectorContract.class
                    );
                }
            }
        }
        return buildPaginationJPA(
                this.injectorContractRepository::findAll,
                searchPaginationInput,
                InjectorContract.class
        );
    }

    @Secured(ROLE_ADMIN)
    @GetMapping("/api/injector_contracts/{injectorContractId}")
    public InjectorContract injectorContract(@PathVariable String injectorContractId) {
        return injectorContractRepository.findById(injectorContractId).orElseThrow(ElementNotFoundException::new);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/injector_contracts")
    @Transactional(rollbackOn = Exception.class)
    public InjectorContract createInjectorContract(@Valid @RequestBody InjectorContractAddInput input) {
        InjectorContract injectorContract = new InjectorContract();
        injectorContract.setCustom(true);
        injectorContract.setUpdateAttributes(input);
        if (!input.getAttackPatternsExternalIds().isEmpty()) {
            injectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllByExternalIdInIgnoreCase(input.getAttackPatternsExternalIds())));
        } else if (!input.getAttackPatternsIds().isEmpty()) {
            injectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        }
        injectorContract.setInjector(updateRelation(input.getInjectorId(), injectorContract.getInjector(), injectorRepository));
        return injectorContractRepository.save(injectorContract);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/injector_contracts/{injectorContractId}")
    public InjectorContract updateInjectorContract(@PathVariable String injectorContractId, @Valid @RequestBody InjectorContractUpdateInput input) {
        InjectorContract injectorContract = injectorContractRepository.findById(injectorContractId).orElseThrow(ElementNotFoundException::new);
        injectorContract.setUpdateAttributes(input);
        injectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        injectorContract.setUpdatedAt(Instant.now());
        return injectorContractRepository.save(injectorContract);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/injector_contracts/{injectorContractId}/mapping")
    public InjectorContract updateInjectorContractMapping(@PathVariable String injectorContractId, @Valid @RequestBody InjectorContractUpdateMappingInput input) {
        InjectorContract injectorContract = injectorContractRepository.findById(injectorContractId).orElseThrow(ElementNotFoundException::new);
        injectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        injectorContract.setUpdatedAt(Instant.now());
        return injectorContractRepository.save(injectorContract);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/injector_contracts/{injectorContractId}")
    public void deleteInjectorContract(@PathVariable String injectorContractId) {
        injectorContractRepository.deleteById(injectorContractId);
    }
}
