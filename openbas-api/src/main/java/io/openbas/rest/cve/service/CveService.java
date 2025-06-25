package io.openbas.rest.cve.service;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.config.cache.LicenseCacheManager;
import io.openbas.database.model.Cve;
import io.openbas.database.repository.CveRepository;
import io.openbas.ee.Ee;
import io.openbas.rest.cve.form.CveCreateInput;
import io.openbas.rest.cve.form.CveUpdateInput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CveService {

  private static final String CVE_NOT_FOUND_MSG = "CVE not found with id: ";

  private final Ee eeService;
  private final CveRepository cveRepository;
  private final LicenseCacheManager licenseCacheManager;

  public Cve createCve(final @Valid CveCreateInput input) {
    final Cve cve = new Cve();
    cve.setUpdateAttributes(input);

    if (isEnterpriseLicenseInactive()) {
      cve.setRemediation(null);
    }
    return cveRepository.save(cve);
  }

  public Page<Cve> searchCves(final @Valid SearchPaginationInput input) {
    return buildPaginationJPA(
        (Specification<Cve> spec, Pageable pageable) -> cveRepository.findAll(spec, pageable),
        input,
        Cve.class);
  }

  public Cve updateCve(final String cveId, final @Valid CveUpdateInput input) {
    final Cve existingCve = findByCveId(cveId);
    existingCve.setUpdateAttributes(input);

    if (isEnterpriseLicenseInactive()) {
      existingCve.setRemediation(null);
    }
    return cveRepository.save(existingCve);
  }

  public Cve findByCveId(final String cveId) {
    return cveRepository
        .findById(cveId)
        .orElseThrow(() -> new EntityNotFoundException(CVE_NOT_FOUND_MSG + cveId));
  }

  public void deleteById(final String cveId) {
    cveRepository.deleteById(cveId);
  }

  private boolean isEnterpriseLicenseInactive() {
    return !eeService.isLicenseActive(licenseCacheManager.getEnterpriseEditionInfo());
  }
}
