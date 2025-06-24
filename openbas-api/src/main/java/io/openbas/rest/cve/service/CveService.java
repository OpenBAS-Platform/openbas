package io.openbas.rest.cve.service;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.Cve;
import io.openbas.database.repository.CveRepository;
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

  private final CveRepository cveRepository;

  public Cve createCve(@Valid CveCreateInput input) {
    Cve cve = new Cve();
    cve.setUpdateAttributes(input);
    return cveRepository.save(cve);
  }

  public Page<Cve> searchCves(@Valid SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        (Specification<Cve> specification, Pageable pageable) ->
            this.cveRepository.findAll(specification, pageable),
        searchPaginationInput,
        Cve.class);
  }

  public Cve findByCveId(String cveId) {
    return cveRepository
        .findById(cveId)
        .orElseThrow(() -> new EntityNotFoundException("CVE not found with id: " + cveId));
  }

  public Cve updateCve(@Valid CveUpdateInput input) {
    Cve cve = new Cve();
    return cveRepository.save(cve);
  }

  public void deleteById(String cveId) {
    cveRepository.deleteById(cveId);
  }
}
