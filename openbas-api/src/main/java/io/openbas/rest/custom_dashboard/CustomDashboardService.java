package io.openbas.rest.custom_dashboard;

import static io.openbas.database.specification.CustomDashboardSpecification.byName;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.CustomDashboard;
import io.openbas.database.model.CustomDashboardParameters;
import io.openbas.database.raw.RawCustomDashboard;
import io.openbas.database.repository.CustomDashboardRepository;
import io.openbas.rest.custom_dashboard.form.CustomDashboardOutput;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.mapper.CustomDashboardMapper;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.EntityNotFoundException;

import java.time.Instant;
import java.util.ArrayList;
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
  private final CustomDashboardMapper customDashboardMapper;

  // -- CRUD --

  /**
   * Creates a new {@link CustomDashboard} entity in the database.
   *
   * @param customDashboard the {@link CustomDashboard} entity to save
   * @return the saved {@link CustomDashboard}
   */
  @Transactional
  public CustomDashboard createCustomDashboard(@NotNull final CustomDashboard customDashboard) {
    CustomDashboardParameters customDashboardTimeRangeParameter = new CustomDashboardParameters();
    customDashboardTimeRangeParameter.setName("Time range");
    customDashboardTimeRangeParameter.setType(
        CustomDashboardParameters.CustomDashboardParameterType.timeRange);
    customDashboardTimeRangeParameter.setCustomDashboard(customDashboard);
    CustomDashboardParameters customDashboardStartDateParameter = new CustomDashboardParameters();
    customDashboardStartDateParameter.setName("Start date");
    customDashboardStartDateParameter.setType(
        CustomDashboardParameters.CustomDashboardParameterType.startDate);
    customDashboardStartDateParameter.setCustomDashboard(customDashboard);
    CustomDashboardParameters customDashboardEndDateParameter = new CustomDashboardParameters();
    customDashboardEndDateParameter.setName("End date");
    customDashboardEndDateParameter.setType(
        CustomDashboardParameters.CustomDashboardParameterType.endDate);
    customDashboardEndDateParameter.setCustomDashboard(customDashboard);
    List<CustomDashboardParameters> customDashboardParametersList = new ArrayList<>(customDashboard.getParameters());
    customDashboardParametersList.add(customDashboardTimeRangeParameter);
    customDashboardParametersList.add(customDashboardStartDateParameter);
    customDashboardParametersList.add(customDashboardEndDateParameter);
    customDashboard.setParameters(customDashboardParametersList);
    return this.customDashboardRepository.save(customDashboard);
  }

  /**
   * Retrieves all {@link CustomDashboard} entities from the database and converts them into
   * {@link CustomDashboardOutput} DTOs.
   *
   * @return list of {@link CustomDashboardOutput} DTOs
   */
  @Transactional(readOnly = true)
  public List<CustomDashboardOutput> customDashboards() {
    List<RawCustomDashboard> customDashboards = customDashboardRepository.rawAll();
    return customDashboardMapper.getCustomDashboardOutputs(customDashboards);
  }

  /**
   * Retrieves a paginated list of {@link CustomDashboard} entities according to the provided
   * {@link SearchPaginationInput}.
   *
   * @param searchPaginationInput the pagination and filtering input
   * @return a {@link Page} of {@link CustomDashboard} entities
   */
  @Transactional(readOnly = true)
  public Page<CustomDashboard> customDashboards(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    return buildPaginationJPA(
        this.customDashboardRepository::findAll, searchPaginationInput, CustomDashboard.class);
  }

  /**
   * Retrieves a single {@link CustomDashboard} entity by its ID.
   *
   * @param id the unique ID of the custom dashboard
   * @return the {@link CustomDashboard} entity
   * @throws EntityNotFoundException if no dashboard is found with the given ID
   */
  @Transactional(readOnly = true)
  public CustomDashboard customDashboard(@NotNull final String id) {
    return this.customDashboardRepository
        .findById(id)
        .orElseThrow(
            () -> new EntityNotFoundException("Custom dashboard not found with id: " + id));
  }

  /**
   * Updates an existing {@link CustomDashboard} entity. The update date is set to the current timestamp.
   *
   * @param customDashboard the {@link CustomDashboard} entity to update
   * @return the updated {@link CustomDashboard}
   */
  @Transactional
  public CustomDashboard updateCustomDashboard(@NotNull final CustomDashboard customDashboard) {
    customDashboard.setUpdateDate(Instant.now());
    return this.customDashboardRepository.save(customDashboard);
  }

  /**
   * Deletes a {@link CustomDashboard} entity by its ID.
   *
   * @param id the unique ID of the dashboard to delete
   * @throws EntityNotFoundException if no dashboard is found with the given ID
   */
  @Transactional
  public void deleteCustomDashboard(@NotNull final String id) {
    if (!this.customDashboardRepository.existsById(id)) {
      throw new EntityNotFoundException("Custom dashboard not found with id: " + id);
    }
    this.customDashboardRepository.deleteById(id);
  }

  // -- OPTION --

  /**
   * Finds all {@link CustomDashboard} entities matching a search text, and returns them as
   * {@link FilterUtilsJpa.Option} DTOs for use in UI dropdowns.
   *
   * @param searchText partial or full name to filter dashboards
   * @return list of {@link FilterUtilsJpa.Option} objects
   */
  public List<FilterUtilsJpa.Option> findAllAsOptions(final String searchText) {
    return fromIterable(
        customDashboardRepository.findAll(
            byName(searchText), Sort.by(Sort.Direction.ASC, "name")))
        .stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }

  /**
   * Finds all {@link CustomDashboard} entities whose IDs are in the given list, and returns them as
   * {@link FilterUtilsJpa.Option} DTOs for use in UI dropdowns.
   *
   * @param ids list of dashboard IDs
   * @return list of {@link FilterUtilsJpa.Option} objects
   */
  public List<FilterUtilsJpa.Option> findAllByIdsAsOptions(final List<String> ids) {
    return fromIterable(customDashboardRepository.findAllById(ids)).stream()
        .map(i -> new FilterUtilsJpa.Option(i.getId(), i.getName()))
        .toList();
  }
}
