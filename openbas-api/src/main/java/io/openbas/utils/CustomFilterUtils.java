package io.openbas.utils;

import io.openbas.database.model.Base;
import io.openbas.database.model.Filters;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.function.UnaryOperator;

public class CustomFilterUtils {

  private CustomFilterUtils() {

  }

  public static <T extends Base> UnaryOperator<Specification<T>> computeMode(
      @NotNull final SearchPaginationInput searchPaginationInput,
      Specification<T> customSpecification) {
    if (Filters.FilterMode.and.equals(searchPaginationInput.getFilterGroup().getMode())) {
      return customSpecification::and;
    } else if (Filters.FilterMode.or.equals(searchPaginationInput.getFilterGroup().getMode())) {
      return customSpecification::or;
    } else {
      return (Specification<T> specification) -> specification;
    }
  }

}
