package io.openbas.rest.scenario.utils;

import io.openbas.database.model.Filters;
import io.openbas.database.model.Scenario;
import io.openbas.database.specification.ScenarioSpecification;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

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
      @NotNull final SearchPaginationInput searchPaginationInput) {
    return handleCustomFilter(searchPaginationInput);
  }

  private static UnaryOperator<Specification<Scenario>> handleCustomFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    // Existence of the filter
    Optional<Filters.Filter> scenarioRecurrenceFilterOpt = ofNullable(searchPaginationInput.getFilterGroup())
        .flatMap(f -> f.findByKey(SCENARIO_RECURRENCE_FILTER));
    Optional<Filters.Filter> scenarioKillChainsFilterOpt = ofNullable(searchPaginationInput.getFilterGroup())
        .flatMap(f -> f.findByKey(SCENARIO_KILL_CHAIN_PHASES_FILTER));
    Optional<Filters.Filter> scenarioTagsFilterOpt = ofNullable(searchPaginationInput.getFilterGroup())
        .flatMap(f -> f.findByKey(SCENARIO_TAGS_FILTER));

    if (scenarioKillChainsFilterOpt.isPresent()) {
    searchPaginationInput.getFilterGroup().removeByKey(SCENARIO_KILL_CHAIN_PHASES_FILTER);
      if (!scenarioKillChainsFilterOpt.get().getValues().isEmpty()) {
        return (Specification<Scenario> specification) -> specification;
      }
    }
    if (scenarioTagsFilterOpt.isPresent()) {
    searchPaginationInput.getFilterGroup().removeByKey(SCENARIO_TAGS_FILTER);
      if (!scenarioTagsFilterOpt.get().getValues().isEmpty()) {
        return (Specification<Scenario> specification) -> specification;
      }
    }

    if (scenarioRecurrenceFilterOpt.isPresent()) {
      // Purge filter
      searchPaginationInput.getFilterGroup().removeByKey(SCENARIO_RECURRENCE_FILTER);
      Specification<Scenario> customSpecification = null;
      if (scenarioRecurrenceFilterOpt.get().getValues().contains("Scheduled")) {
        customSpecification = ScenarioSpecification.isRecurring();
      } else if (scenarioRecurrenceFilterOpt.get().getValues().contains("Not planned")) {
        customSpecification = ScenarioSpecification.noRecurring();
      }
      if (customSpecification != null) {
        return computeMode(searchPaginationInput, customSpecification);
      }
      return (Specification<Scenario> specification) -> specification;
    } else {
      return (Specification<Scenario> specification) -> specification;
    }
  }

}
