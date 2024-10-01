package io.openbas.rest.scenario.utils;

import io.openbas.database.model.Filters;
import io.openbas.database.model.Scenario;
import io.openbas.database.specification.ScenarioSpecification;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.UnaryOperator;

import static io.openbas.utils.CustomFilterUtils.computeMode;
import static java.util.Optional.ofNullable;

public class ScenarioUtils {

  private ScenarioUtils() {

  }

  private static final String SCENARIO_RECURRENCE_FILTER = "scenario_recurrence";
  private static final String SCENARIO_KILL_CHAIN_PHASES_FILTER = "scenario_kill_chain_phases";
  private static final String SCENARIO_TAGS_FILTER = "scenario_tags";

  /**
   * Manage filters that are not directly managed by the generic mechanics -> scenario_recurrence, scenario_tags, scenario_kill_chain_phases
   */
  public static Function<Specification<Scenario>, Specification<Scenario>> handleDeepFilter(
      @NotNull SearchPaginationInput searchPaginationInput) {
    return handleCustomFilter(searchPaginationInput);
  }

  private static UnaryOperator<Specification<Scenario>> handleCustomFilter(
      @NotNull SearchPaginationInput searchPaginationInput) {

    // Extract filters from the input
    Optional<Filters.Filter> scenarioRecurrenceFilterOpt = getFilter(searchPaginationInput, SCENARIO_RECURRENCE_FILTER);
    Optional<Filters.Filter> scenarioKillChainsFilterOpt = getFilter(searchPaginationInput, SCENARIO_KILL_CHAIN_PHASES_FILTER);
    Optional<Filters.Filter> scenarioTagsFilterOpt = getFilter(searchPaginationInput, SCENARIO_TAGS_FILTER);

    if (scenarioKillChainsFilterOpt.isPresent() && hasValues(scenarioKillChainsFilterOpt)) {
      return createSpecification();
    }

    if (scenarioTagsFilterOpt.isPresent() && hasValues(scenarioTagsFilterOpt)) {
      return createSpecification();
    }

    if (scenarioRecurrenceFilterOpt.isPresent()) {
      searchPaginationInput.getFilterGroup().removeByKey(SCENARIO_RECURRENCE_FILTER);
      return handleRecurrenceFilter(searchPaginationInput, scenarioRecurrenceFilterOpt);
    }

    return createSpecification();
  }

  private static Optional<Filters.Filter> getFilter(SearchPaginationInput input, String key) {
    return ofNullable(input.getFilterGroup()).flatMap(f -> f.findByKey(key));
  }

  private static boolean hasValues(Optional<Filters.Filter> filterOpt) {
    List<?> values = filterOpt.get().getValues();
    return values != null && !values.isEmpty();
  }

  private static UnaryOperator<Specification<Scenario>> createSpecification() {
    return specification -> specification;
  }

  private static UnaryOperator<Specification<Scenario>> handleRecurrenceFilter(
      SearchPaginationInput searchPaginationInput, Optional<Filters.Filter> filterOpt) {
    Specification<Scenario> customSpecification = null;

    if (filterOpt.get().getValues().contains("Scheduled")) {
      customSpecification = ScenarioSpecification.isRecurring();
    } else if (filterOpt.get().getValues().contains("Not planned")) {
      customSpecification = ScenarioSpecification.noRecurring();
    }

    if (customSpecification != null) {
      return computeMode(searchPaginationInput, customSpecification);
    }

    return createSpecification();
  }

}
