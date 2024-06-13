package io.openbas.rest.injector_contract;

import io.openbas.database.model.InjectorContract;
import io.openbas.database.raw.RawInjectorsContrats;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.rest.injector_contract.form.InjectorContractAddInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateMappingInput;
import io.openbas.rest.injector_contract.service.InjectorContractService;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

import static io.openbas.database.model.User.ROLE_ADMIN;

@RequiredArgsConstructor
@RestController
public class InjectorContractApi extends RestBehavior {

    private final InjectorContractService injectorContractService;

    @GetMapping("/api/injector_contracts")
    public Iterable<RawInjectorsContrats> injectContracts() {
        return injectorContractService.getAllRawInjectorsContracts();
    }

    @PostMapping("/api/injector_contracts/search")
    public Page<InjectorContract> injectorContracts(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
        return injectorContractService.getInjectorContracts(searchPaginationInput);
    }

    @Secured(ROLE_ADMIN)
    @GetMapping("/api/injector_contracts/{injectorContractId}")
    public InjectorContract injectorContract(@PathVariable String injectorContractId) {
        return injectorContractService.getInjectorContractById(injectorContractId);
    }

    @Secured(ROLE_ADMIN)
    @PostMapping("/api/injector_contracts")
    @Transactional(rollbackOn = Exception.class)
    public InjectorContract createInjectorContract(@Valid @RequestBody InjectorContractAddInput input) {
        return injectorContractService.createInjectorContract(input);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/injector_contracts/{injectorContractId}")
    public InjectorContract updateInjectorContract(@PathVariable String injectorContractId, @Valid @RequestBody InjectorContractUpdateInput input) {
        return injectorContractService.updateInjectorContract(injectorContractId, input);
    }

    @Secured(ROLE_ADMIN)
    @PutMapping("/api/injector_contracts/{injectorContractId}/mapping")
    public InjectorContract updateInjectorContractMapping(@PathVariable String injectorContractId, @Valid @RequestBody InjectorContractUpdateMappingInput input) {
        return injectorContractService.updateInjectorContractMapping(injectorContractId, input);
    }

    @Secured(ROLE_ADMIN)
    @DeleteMapping("/api/injector_contracts/{injectorContractId}")
    public void deleteInjectorContract(@PathVariable String injectorContractId) {
        injectorContractService.deleteInjectorContract(injectorContractId);
    }
}
