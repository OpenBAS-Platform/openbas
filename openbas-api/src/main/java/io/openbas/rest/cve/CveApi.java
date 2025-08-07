package io.openbas.rest.cve;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.aop.LogExecutionTime;
import io.openbas.rest.cve.form.*;
import io.openbas.rest.cve.service.CveService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.mapper.CveMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
@Tag(name = "CVE API", description = "Operations related to CVEs")
public class CveApi extends RestBehavior {

  public static final String CVE_API = "/api/cves";

  private final CveService cveService;
  private final CveMapper cveMapper;

  @LogExecutionTime
  @Operation(summary = "Search CVEs")
  @PostMapping(CVE_API + "/search")
  public Page<CveSimple> searchCves(@Valid @RequestBody SearchPaginationInput input) {
    return cveService.searchCves(input).map(cveMapper::toCveSimple);
  }

  @Operation(summary = "Get a CVE by ID", description = "Fetches detailed CVE info by ID")
  @GetMapping(CVE_API + "/{cveId}")
  public CveOutput getCve(@PathVariable String cveId) {
    return cveMapper.toCveOutput(cveService.findById(cveId));
  }

  @Operation(
      summary = "Get a CVE by external ID",
      description = "Fetches detailed CVE info by external CVE ID")
  @GetMapping(CVE_API + "/external-id/{externalId}")
  public CveOutput getCvebyExternalId(@PathVariable String externalId) {
    return cveMapper.toCveOutput(cveService.findByExternalId(externalId));
  }

  @Secured(ROLE_ADMIN)
  @Operation(summary = "Create a new CVE")
  @PostMapping(CVE_API)
  @Transactional(rollbackOn = Exception.class)
  public CveSimple createCve(@Valid @RequestBody CveCreateInput input) {
    return cveMapper.toCveSimple(cveService.createCve(input));
  }

  @Secured(ROLE_ADMIN)
  @Operation(summary = "Bulk insert CVEs")
  @LogExecutionTime
  @PostMapping(CVE_API + "/bulk")
  public void bulkInsertCVEsForCollector(@Valid @RequestBody @NotNull CVEBulkInsertInput input) {
    this.cveService.bulkUpsertCVEs(input);
  }

  @Secured(ROLE_ADMIN)
  @Operation(summary = "Update an existing CVE")
  @PutMapping(CVE_API + "/{cveId}")
  @Transactional(rollbackOn = Exception.class)
  public CveSimple updateCve(@PathVariable String cveId, @Valid @RequestBody CveUpdateInput input) {
    return cveMapper.toCveSimple(cveService.updateCve(cveId, input));
  }

  @Secured(ROLE_ADMIN)
  @Operation(summary = "Delete a CVE")
  @DeleteMapping(CVE_API + "/{cveId}")
  @Transactional(rollbackOn = Exception.class)
  public void deleteCve(@PathVariable String cveId) {
    cveService.deleteById(cveId);
  }
}
