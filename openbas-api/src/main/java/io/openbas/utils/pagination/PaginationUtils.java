package io.openbas.utils.pagination;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.function.BiFunction;

import static io.openbas.utils.FilterUtilsJpa.computeFilterGroupJpa;
import static io.openbas.utils.pagination.SearchUtilsJpa.computeSearchJpa;
import static io.openbas.utils.pagination.SortUtilsJpa.toSortJpa;

public class PaginationUtils {

  // -- JPA --

  public static <T> Page<T> buildPaginationJPA(
      @NotNull final BiFunction<Specification<T>, Pageable, Page<T>> findAll,
      @NotNull final SearchPaginationInput input,
      @NotNull final Class<T> clazz) {
    // Specification
    Specification<T> filterSpecifications = computeFilterGroupJpa(input.getFilterGroup());
    Specification<T> searchSpecifications = computeSearchJpa(input.getTextSearch());

    // Pageable
    Pageable pageable = PageRequest.of(input.getPage(), input.getSize(), toSortJpa(input.getSorts(), clazz));

    return findAll.apply(filterSpecifications.and(searchSpecifications), pageable);
  }

  // -- CRITERIA BUILDER --

  public static <T, U> Page<U> buildPaginationCriteriaBuilder(
      @NotNull final BiFunction<Specification<T>, Pageable, Page<U>> findAll,
      @NotNull final SearchPaginationInput input,
      @NotNull final Class<T> clazz) {
    // Specification
    Specification<T> filterSpecifications = computeFilterGroupJpa(input.getFilterGroup());
    Specification<T> searchSpecifications = computeSearchJpa(input.getTextSearch());

    // Pageable
    Pageable pageable = PageRequest.of(input.getPage(), input.getSize(), toSortJpa(input.getSorts(), clazz));

    return findAll.apply(filterSpecifications.and(searchSpecifications), pageable);
  }

  /**
   * Build PaginationJPA with a specified specifications
   * @param findAll the find all method
   * @param input the search inputs
   * @param specification the specified specification
   * @param clazz the class that we're looking for
   * @return a Page of results
   */
  public static <T> Page<T> buildPaginationJPA(
          @NotNull final BiFunction<Specification<T>, Pageable, Page<T>> findAll,
          @NotNull final SearchPaginationInput input,
          Specification<T> specification,
          @NotNull final Class<T> clazz) {
    // Specification
    Specification<T> filterSpecifications = computeFilterGroupJpa(input.getFilterGroup());

    // Pageable
    Pageable pageable = PageRequest.of(input.getPage(), input.getSize(), toSortJpa(input.getSorts(), clazz));

    return findAll.apply(filterSpecifications.and(specification), pageable);
  }

}
