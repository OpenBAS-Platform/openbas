package io.openbas.service.organization;

import static io.openbas.config.SessionHelper.currentUser;
import static io.openbas.database.specification.OrganizationSpecification.findGrantedFor;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.config.OpenBASPrincipal;
import io.openbas.database.model.Organization;
import io.openbas.database.repository.OrganizationRepository;
import io.openbas.utils.pagination.SearchPaginationInput;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrganizationService {

  private final OrganizationRepository organizationRepository;

  public Page<Organization> organizationPagination(
      @NotNull SearchPaginationInput searchPaginationInput) {
    OpenBASPrincipal currentUser = currentUser();
    if (currentUser.isAdmin()) {
      return buildPaginationJPA(
          (Specification<Organization> specification, Pageable pageable) ->
              this.organizationRepository.findAll(specification, pageable),
          searchPaginationInput,
          Organization.class);
    } else {
      return buildPaginationJPA(
          (Specification<Organization> specification, Pageable pageable) ->
              this.organizationRepository.findAll(
                  findGrantedFor(currentUser.getId()).and(specification), pageable),
          searchPaginationInput,
          Organization.class);
    }
  }
}
