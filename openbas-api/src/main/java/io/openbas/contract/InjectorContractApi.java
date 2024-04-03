package io.openbas.contract;

import io.openbas.database.model.InjectorContract;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

@RequiredArgsConstructor
@RestController
@PreAuthorize("isAdmin()")
@RequestMapping("/api/injector_contracts")
public class InjectorContractApi extends RestBehavior {

  private final InjectorContractRepository injectorContractRepository;

  @PostMapping("/search")
  @Operation(summary = "Retrieves a paginated list of injector contracts")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Page of injector contracts"),
      @ApiResponse(responseCode = "400", description = "Bad parameters")
  })
  public Page<InjectorContract> injectors(@RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        this.injectorContractRepository::findAll,
        searchPaginationInput,
        InjectorContract.class
    );
  }
}
