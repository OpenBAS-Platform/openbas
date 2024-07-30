package io.openbas.utils;

import io.openbas.database.model.Base;
import io.openbas.database.model.Filters;
import io.openbas.database.model.InjectorContract;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.validation.constraints.NotBlank;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import static io.openbas.utils.FilterUtilsJpa.computeFilterFromSpecificPath;
import static java.util.Optional.ofNullable;

public class CustomFilterUtils {

  private CustomFilterUtils() {

  }

  /**
   * Manage filters that are not directly managed by the generic mechanics
   */
  public static <T extends Base> Function<Specification<T>, Specification<T>> handleCustomFilter(
      @NotNull final SearchPaginationInput searchPaginationInput,
      @NotBlank final String customFilterKey,
      @NotNull final Map<String, String> correspondenceMap) {
    Function<Specification<T>, Specification<T>> finalSpecification;
    // Existence of the filter
    Optional<Filters.Filter> killChainPhaseFilterOpt = ofNullable(searchPaginationInput.getFilterGroup())
        .flatMap(f -> f.findByKey(customFilterKey));

    if (killChainPhaseFilterOpt.isPresent()) {
      // Purge filter
      searchPaginationInput.getFilterGroup().removeByKey(customFilterKey);
      Specification<T> customSpecification = computeFilterFromSpecificPath(
          killChainPhaseFilterOpt.get(), correspondenceMap.get(customFilterKey)
      );
      // Final specification
      if (Filters.FilterMode.and.equals(searchPaginationInput.getFilterGroup().getMode())) {
        finalSpecification = customSpecification::and;
      } else if (Filters.FilterMode.or.equals(searchPaginationInput.getFilterGroup().getMode())) {
        finalSpecification = customSpecification::or;
      } else {
        finalSpecification = (Specification<T> specification) -> specification;
      }
    } else {
      finalSpecification = (Specification<T> specification) -> specification;
    }
    return finalSpecification;
  }

}
