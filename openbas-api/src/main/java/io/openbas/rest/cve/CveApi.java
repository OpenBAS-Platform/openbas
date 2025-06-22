package io.openbas.rest.cve;

import static io.openbas.database.model.User.ROLE_ADMIN;
import static io.openbas.database.model.User.ROLE_USER;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.Cve;
import io.openbas.database.repository.CveRepository;
import io.openbas.rest.cve.form.CveCreateInput;
import io.openbas.rest.cve.form.CveOutput;
import io.openbas.rest.cve.form.CveSimple;
import io.openbas.rest.cve.form.CveUpdateInput;
import io.openbas.rest.cve.service.CveService;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.helper.RestBehavior;
import io.openbas.utils.CveMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;

@RestController
@Secured(ROLE_USER)
@RequiredArgsConstructor
public class CveApi extends RestBehavior {

  public static final String CVE_API = "/api/cves";
  private final CveService cveService;
  private final CveMapper cveMapper;

  private final CveRepository cveRepository;

  @PostMapping(CVE_API + "/search")
  public Page<CveSimple> cves(
      @RequestBody @Valid final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
            (Specification<Cve> specification, Pageable pageable) ->
                this.cveRepository.findAll(specification, pageable),
            searchPaginationInput,
            Cve.class)
        .map(cveMapper::toCveSimple);
  }

  @GetMapping(CVE_API + "/{cveId}")
  public CveOutput cve(@PathVariable String cveId) {
    return cveMapper.toCveOutput(
        cveRepository.findById(cveId).orElseThrow(ElementNotFoundException::new));
  }

  @Secured(ROLE_ADMIN)
  @PostMapping(CVE_API)
  @Transactional(rollbackOn = Exception.class)
  public CveSimple createCve(@Valid @RequestBody CveCreateInput input) {
    Cve cve = new Cve();
    return cveMapper.toCveSimple(cveRepository.save(cve));
  }

  @Secured(ROLE_ADMIN)
  @PutMapping(CVE_API + "/{cveId}")
  @Transactional(rollbackOn = Exception.class)
  public CveSimple updateCve(
      @NotBlank @PathVariable final String cveId, @Valid @RequestBody CveUpdateInput input) {
    Cve cve = new Cve();
    return cveMapper.toCveSimple(cveRepository.save(cve));
  }

  @Secured(ROLE_ADMIN)
  @DeleteMapping(CVE_API + "/{cveId}")
  @Transactional(rollbackOn = Exception.class)
  public void deleteCve(@PathVariable String cveId) {
    cveRepository.deleteById(cveId);
  }
}
