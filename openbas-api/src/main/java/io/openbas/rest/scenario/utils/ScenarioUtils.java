package io.openbas.rest.scenario.utils;

import io.openbas.database.model.Scenario;
import io.openbas.utils.CustomFilterUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.Map;
import java.util.function.Function;

public class ScenarioUtils {

  private static final String SCENARIO_KILL_CHAIN_PHASES_FILTER = "scenario_kill_chain_phases";
  private static final Map<String, String> CORRESPONDENCE_MAP = Collections.singletonMap(
      SCENARIO_KILL_CHAIN_PHASES_FILTER, "injects.injectorContract.attackPatterns.killChainPhases.id"
  );

  private ScenarioUtils() {

  }

  /**
   * Manage filters that are not directly managed by the generic mechanics -> scenario_kill_chain_phases
   */
  public static Function<Specification<Scenario>, Specification<Scenario>> handleCustomFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    return CustomFilterUtils.handleCustomFilter(
        searchPaginationInput,
        SCENARIO_KILL_CHAIN_PHASES_FILTER,
        CORRESPONDENCE_MAP
    );
  }

}
