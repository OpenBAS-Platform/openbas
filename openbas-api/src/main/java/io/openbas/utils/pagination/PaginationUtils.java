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

  private PaginationUtils() {

  }

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
   * Build PaginationJPA with a specified search specifications that replace the default ones
   * @param findAll the find all method
   * @param input the search inputs
   * @param clazz the class that we're looking for
   * @param specificSearchSpecification the specified
   *                                    search specification (will replace the default ones)
   * @return a Page of results
   */
  public static <T> Page<T> buildPaginationJPA(
          @NotNull final BiFunction<Specification<T>, Pageable, Page<T>> findAll,
          @NotNull final SearchPaginationInput input,
          @NotNull final Class<T> clazz,
          Specification<T> specificSearchSpecification) {
    // Specification
    Specification<T> filterSpecifications = computeFilterGroupJpa(input.getFilterGroup());

    // Pageable
    Pageable pageable = PageRequest.of(input.getPage(), input.getSize(), toSortJpa(input.getSorts(), clazz));

    return findAll.apply(filterSpecifications.and(specificSearchSpecification), pageable);
  }

}
