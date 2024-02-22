package io.openex.rest.contract;

import io.openex.contract.Contract;
import io.openex.contract.ContractConfig;
import io.openex.rest.helper.RestBehavior;
import io.openex.service.ContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/contracts")
public class ContractApi extends RestBehavior {

    private final ContractService contractService;

    @GetMapping
    @Operation(
            summary = "Retrieves a paginated list of contracts",
            extensions = {
                    @Extension(
                            name = "contracts",
                            properties = {
                                    @ExtensionProperty(name = "httpMethod", value = "GET"),
                                    @ExtensionProperty(name = "authorizer", value = "none") //TODO
                            }
                    )
            }
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Page of contracts"),
            @ApiResponse(responseCode = "400", description = "Bad parameters")
    })
    //TODO ContractDTO
    public Page<Contract> searchExposedContracts(@RequestParam(required = false) String type,
                                                 @RequestParam(defaultValue = "true") boolean exposedContractsOnly,
                                                 @RequestParam(required = false) String textSearch,
                                                 @RequestParam(defaultValue = "type") String sortBy,
                                                 @RequestParam(defaultValue = "asc") String sortOrder,
                                                 @RequestParam @Min(0) int page,
                                                 @RequestParam @Max(10) int size) {

        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return contractService.searchContracts(type, exposedContractsOnly, textSearch, pageable);
    }

    @GetMapping("/images")
    public @ResponseBody Map<String, String> contractIcon() {
        List<ContractConfig> contractTypes = this.contractService.getContractConfigs();
        Map<String, String> map = new HashMap<>();
        contractTypes.forEach((contract -> {
            try {
                String fileName = contract.getIcon();
                InputStream in = getClass().getResourceAsStream(fileName);
                assert in != null;
                byte[] fileContent;
                fileContent = IOUtils.toByteArray(in);
                String encodedString = Base64.getEncoder().encodeToString(fileContent);
                map.put(contract.getType(), encodedString);
            } catch (Exception e) {
                log.debug("Logo not found for contract : " + contract.getType());
            }
        }));
        return map;
    }

}
