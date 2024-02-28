package io.openex.contract;

import io.openex.rest.helper.RestBehavior;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.openex.contract.ContractService.TYPE;

@RequiredArgsConstructor
@RestController
@Slf4j
@PreAuthorize("hasRole('ROLE_ADMIN')")
@RequestMapping("/api/contracts")
public class ContractApi extends RestBehavior {

    private final ContractService contractService;

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

    @PostMapping
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
    //TODO ContractDTO
    public Page<Contract> searchExposedContracts(@RequestBody ContractSearchInput contractSearchInput,
                                                 @RequestParam(defaultValue = "0") @Min(0) int page,
                                                 @RequestParam(defaultValue = "10") @Max(20) int size,
                                                 @RequestParam(required = false) List<String> sort) {

        Sort sortFromQuery = convertToSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortFromQuery);
        return contractService.searchContracts(contractSearchInput, pageable);
    }

    private Sort convertToSort(List<String> sortFields) {
        List<Sort.Order> orders;

        if (null == sortFields || sortFields.isEmpty()) {
            orders = List.of(new Sort.Order(Sort.DEFAULT_DIRECTION, TYPE));
        } else {
            orders = sortFields.stream().map(field -> {
                String[] propertyAndDirection = field.split(":");
                String property = propertyAndDirection[0];
                Sort.Direction direction = Sort.DEFAULT_DIRECTION;
                if (propertyAndDirection.length > 1) {
                    String directionString = propertyAndDirection[1];
                    direction = Sort.Direction.fromOptionalString(directionString).orElse(Sort.DEFAULT_DIRECTION);
                }
                return new Sort.Order(direction, property);
            }).toList();
        }

        return Sort.by(orders);
    }

}
