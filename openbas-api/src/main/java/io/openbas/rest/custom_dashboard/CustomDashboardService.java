package io.openbas.rest.custom_dashboard;

import static io.openbas.database.specification.CustomDashboardSpecification.byName;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.repository.CustomDashboardRepository;
import io.openbas.rest.custom_dashboard.form.CustomDashboardOutput;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomDashboardService {

  private final CustomDashboardRepository customDashboardRepository;

  // -- CRUD --

  @Transactional
  public CustomDashboard createCustomDashboard(@NotNull final CustomDashboard customDashboard) {
    return this.customDashboardRepository.save(customDashboard);
  }

  @Transactional(readOnly = true)
  public List<CustomDashboardOutput> customDashboards() {
    List<CustomDashboard> customDashboards = fromIterable(this.customDashboardRepository.findAll());
    return customDashboards.stream().map(CustomDashboardOutput::toCustomDashboard).toList();
  }

  @Transactional(readOnly = true)
  public Page<CustomDashboard> customDashboards(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        this.customDashboardRepository::findAll, searchPaginationInput, CustomDashboard.class);
  }

  @Transactional(readOnly = true)
  public CustomDashboard customDashboard(@NotNull final String id) {
    return this.customDashboardRepository
        .findById(id)
        .orElseThrow(
            () -> new EntityNotFoundException("Custom dashboard not found with id: " + id));
  }

  @Transactional
  public CustomDashboard updateCustomDashboard(@NotNull final CustomDashboard customDashboard) {
    customDashboard.setUpdateDate(Instant.now());
    return this.customDashboardRepository.save(customDashboard);
  }

  @Transactional
  public void deleteCustomDashboard(@NotNull final String id) {
    if (!this.customDashboardRepository.existsById(id)) {
      throw new EntityNotFoundException("Custom dashboard not found with id: " + id);
    }
    this.customDashboardRepository.deleteById(id);
  }

  // -- OPTION --

  public List<FilterUtilsJpa.Option> findAllAsOptions(final String searchText) {
    return fromIterable(
            customDashboardRepository.findAll(
                byName(searchText), Sort.by(Sort.Direction.ASC, "name")))
        .stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }

  public List<FilterUtilsJpa.Option> findAllByIdsAsOptions(final List<String> ids) {
    return fromIterable(customDashboardRepository.findAllById(ids)).stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }
}
