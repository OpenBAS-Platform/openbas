package io.openbas.rest.injector_contract.service;

import io.openbas.database.model.Filters;
import io.openbas.database.model.InjectorContract;
import io.openbas.database.raw.RawInjectorsContrats;
import io.openbas.database.repository.AttackPatternRepository;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.database.specification.InjectorContractSpecification;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.injector_contract.form.InjectorContractAddInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateMappingInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@Service
@RequiredArgsConstructor
public class InjectorContractService {

    private final AttackPatternRepository attackPatternRepository;

    private final InjectorRepository injectorRepository;

    private final InjectorContractRepository injectorContractRepository;

    public Iterable<RawInjectorsContrats> getAllRawInjectorsContracts() {
        return injectorContractRepository.getAllRawInjectorsContracts();
    }

    public Page<InjectorContract> getInjectorContracts(@NotNull final SearchPaginationInput searchPaginationInput) {
        if( searchPaginationInput.getFilterGroup() != null && searchPaginationInput.getFilterGroup().getFilters() != null ) {
            List<Filters.Filter> killChainPhaseFilters = searchPaginationInput.getFilterGroup().getFilters().stream().filter(filter -> filter.getKey().equals("injector_contract_kill_chain_phases")).toList();
            if (!killChainPhaseFilters.isEmpty()) {
                Filters.Filter killChainPhaseFilter = killChainPhaseFilters.getFirst();
                if (!killChainPhaseFilter.getValues().isEmpty()) {
                    // Purge filter
                    SearchPaginationInput newSearchPaginationInput = getNewSearchPaginationInput(searchPaginationInput);
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

    public InjectorContract getInjectorContractById(@NotBlank String id) {
        return injectorContractRepository.findById(id).orElseThrow(ElementNotFoundException::new);
    }

    public InjectorContract createInjectorContract(@NotNull InjectorContractAddInput input) {
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

    public InjectorContract updateInjectorContract(@NotBlank String injectorContractId, @NotNull InjectorContractUpdateInput input) {
        InjectorContract injectorContract = injectorContractRepository.findById(injectorContractId).orElseThrow(ElementNotFoundException::new);
        injectorContract.setUpdateAttributes(input);
        injectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        injectorContract.setUpdatedAt(Instant.now());
        return injectorContractRepository.save(injectorContract);
    }

    public InjectorContract updateInjectorContractMapping(@NotBlank String injectorContractId, @NotNull InjectorContractUpdateMappingInput input) {
        InjectorContract injectorContract = injectorContractRepository.findById(injectorContractId).orElseThrow(ElementNotFoundException::new);
        injectorContract.setAttackPatterns(fromIterable(attackPatternRepository.findAllById(input.getAttackPatternsIds())));
        injectorContract.setUpdatedAt(Instant.now());
        return injectorContractRepository.save(injectorContract);
    }

    public void deleteInjectorContract(@NotBlank String injectorContractId) {
        injectorContractRepository.deleteById(injectorContractId);
    }

    private SearchPaginationInput getNewSearchPaginationInput(SearchPaginationInput input) {
        SearchPaginationInput newSearchPaginationInput = new SearchPaginationInput();
        newSearchPaginationInput.setTextSearch(input.getTextSearch());
        newSearchPaginationInput.setSize(input.getSize());
        newSearchPaginationInput.setSorts(input.getSorts());
        newSearchPaginationInput.setPage(input.getPage());
        Filters.FilterGroup newFilterGroup = new Filters.FilterGroup();
        newFilterGroup.setFilters(input.getFilterGroup().getFilters().stream().filter(filter -> !filter.getKey().equals("injector_contract_kill_chain_phases")).toList());
        newSearchPaginationInput.setFilterGroup(newFilterGroup);
        return newSearchPaginationInput;
    }
}
