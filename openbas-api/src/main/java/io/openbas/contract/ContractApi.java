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
import org.apache.commons.io.IOUtils;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

@RequiredArgsConstructor
@RestController
@Log
@PreAuthorize("isAdmin()")
@RequestMapping("/api/contracts")
public class ContractApi extends RestBehavior {

    private final ContractService contractService;

    @GetMapping("/images")
    public @ResponseBody Map<String, String> contractIcon() {
        List<ContractConfig> contractTypes = this.contractService.getContractConfigs();
        Map<String, String> map = new HashMap<>();
        contractTypes.forEach(contract -> {
            try {
                String fileName = contract.getIcon();
                InputStream in = getClass().getResourceAsStream(fileName);
                assert in != null;
                byte[] fileContent;
                fileContent = IOUtils.toByteArray(in);
                String encodedString = Base64.getEncoder().encodeToString(fileContent);
                map.put(contract.getType(), encodedString);
            } catch (Exception e) {
                log.log(Level.FINE, "Logo not found for contract : " + contract.getType());
            }
        });
        return map;
    }

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
