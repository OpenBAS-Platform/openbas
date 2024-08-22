package io.openbas.rest.exercise.utils;

import io.openbas.database.model.Exercise;
import io.openbas.utils.CustomFilterUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.Map;
import java.util.function.UnaryOperator;

public class ExerciseUtils {

  private static final String EXERCISE_KILL_CHAIN_PHASES_FILTER = "exercise_kill_chain_phases";
  private static final Map<String, String> CORRESPONDENCE_MAP = Collections.singletonMap(
      EXERCISE_KILL_CHAIN_PHASES_FILTER, "injects.injectorContract.attackPatterns.killChainPhases.id"
  );

  private ExerciseUtils() {

  }

  /**
   * Manage filters that are not directly managed by the generic mechanics -> exercise_kill_chain_phases
   */
  public static UnaryOperator<Specification<Exercise>> handleCustomFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    return CustomFilterUtils.handleCustomFilter(
        searchPaginationInput,
        EXERCISE_KILL_CHAIN_PHASES_FILTER,
        CORRESPONDENCE_MAP
    );
  }

}
