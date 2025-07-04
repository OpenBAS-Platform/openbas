package io.openbas.rest.simulation;

import static io.openbas.database.specification.ExerciseSpecification.byName;
import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.FilterUtilsJpa.PAGE_NUMBER_OPTION;
import static io.openbas.utils.FilterUtilsJpa.PAGE_SIZE_OPTION;

import io.openbas.database.repository.ExerciseRepository;
import io.openbas.utils.FilterUtilsJpa.Option;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class SimulationService {

  private final ExerciseRepository exerciseRepository;

  /**
   * Retrieves all exercises whose names match the provided search text, and converts them into
   * {@link Option} DTOs for UI consumption.
   *
   * @param searchText partial or full name to filter exercises
   * @return list of {@link Option} objects containing exercise IDs and names
   */
  public List<Option> findAllAsOptions(final String searchText) {
    Pageable pageable =
        PageRequest.of(PAGE_NUMBER_OPTION, PAGE_SIZE_OPTION, Sort.by(Sort.Direction.ASC, "name", "createdAt"));
    return fromIterable(exerciseRepository.findAll(byName(searchText), pageable)).stream()
        .map(i -> new Option(i.getId(), i.getName()))
        .toList();
  }

  /**
   * Retrieves all exercises with IDs matching the given list, and converts them into {@link Option}
   * DTOs for UI consumption.
   *
   * @param ids list of exercise IDs to retrieve
   * @return list of {@link Option} objects containing exercise IDs and names
   */
  public List<Option> findAllByIdsAsOptions(final List<String> ids) {
    return fromIterable(exerciseRepository.findAllById(ids)).stream()
        .map(i -> new Option(i.getId(), i.getName()))
        .toList();
  }
}
