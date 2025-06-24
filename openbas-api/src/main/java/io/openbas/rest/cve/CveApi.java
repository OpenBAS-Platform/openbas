package io.openbas.rest.cve;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;

import io.openbas.rest.cve.form.CveCreateInput;
import io.openbas.rest.cve.form.CveOutput;
import io.openbas.rest.cve.form.CveSimple;
import io.openbas.rest.cve.form.CveUpdateInput;
import io.openbas.rest.cve.service.CveService;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.CveMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class CveApi extends RestBehavior {

  public static final String CVE_API = "/api/cves";
  private final CveService cveService;
  private final CveMapper cveMapper;

  @PostMapping(CVE_API + "/search")
  public Page<CveSimple> cves(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return cveService.searchCves(searchPaginationInput).map(cveMapper::toCveSimple);
  }

  @GetMapping(CVE_API + "/{cveId}")
  public CveOutput cve(@PathVariable String cveId) {
    return cveMapper.toCveOutput(cveService.findByCveId(cveId));
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(CVE_API)
  @Transactional(rollbackOn = Exception.class)
  public CveSimple createCve(@Valid @RequestBody CveCreateInput input) {
    return cveMapper.toCveSimple(cveService.createCve(input));
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(CVE_API + "/{cveId}")
  @Transactional(rollbackOn = Exception.class)
  public CveSimple updateCve(
      @NotBlank @PathVariable final String cveId, @Valid @RequestBody CveUpdateInput input) {
    return cveMapper.toCveSimple(cveService.updateCve(cveId, input));
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(CVE_API + "/{cveId}")
  @Transactional(rollbackOn = Exception.class)
  public void deleteCve(@PathVariable String cveId) {
    cveService.deleteById(cveId);
  }
}
