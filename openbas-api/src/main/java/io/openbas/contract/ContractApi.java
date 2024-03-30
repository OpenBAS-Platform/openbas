package io.openbas.contract;

import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Log
@PreAuthorize("isAdmin()")
@RequestMapping("/api/contracts")
public class ContractApi extends RestBehavior {

    private final ContractService contractService;

    @PostMapping("/search")
    @Operation(
            summary = "Retrieves a paginated list of contracts",
            extensions = {
                    @Extension(
                            name = "contracts",
                            properties = {
                                    @ExtensionProperty(name = "httpMethod", value = "POST")
                            }
                    )
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Page of contracts"),
            @ApiResponse(responseCode = "400", description = "Bad parameters")
    })
    public Page<Contract> searchExposedContracts(@RequestBody @Valid SearchPaginationInput searchPaginationInput) {
        return contractService.searchContracts(searchPaginationInput);
    }
}
