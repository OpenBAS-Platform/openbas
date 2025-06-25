package io.openbas.rest.simulation;

import io.openbas.database.repository.ExerciseRepository;
import io.openbas.utils.FilterUtilsJpa.Option;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

import static io.openbas.database.specification.ExerciseSpecification.byName;
import static io.openbas.helper.StreamHelper.fromIterable;

@RequiredArgsConstructor
@Service
public class SimulationService {

  private final ExerciseRepository exerciseRepository;

  public List<Option> findAllAsOptions(final String searchText) {
    return fromIterable(
        exerciseRepository.findAll(byName(searchText), Sort.by(Sort.Direction.ASC, "name")))
        .stream()
        .map(i -> new Option(i.getId(), i.getName()))
        .toList();
  }

  public List<Option> findAllByIdsAsOptions(final List<String> ids) {
    return fromIterable(exerciseRepository.findAllById(ids))
        .stream()
        .map(i -> new Option(i.getId(), i.getName()))
        .toList();
  }

}
