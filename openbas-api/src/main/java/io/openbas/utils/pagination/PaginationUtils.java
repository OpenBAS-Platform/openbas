package io.openbas.utils.pagination;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.List;
import java.util.function.BiFunction;

import static io.openbas.utils.FilterUtilsJpa.computeFilterGroupJpa;
import static io.openbas.utils.FilterUtilsRuntime.computeFilterGroupRuntime;
import static io.openbas.utils.pagination.SearchUtilsJpa.computeSearchJpa;
import static io.openbas.utils.pagination.SearchUtilsRuntime.computeSearchRuntime;
import static io.openbas.utils.pagination.SortUtilsJpa.toSortJpa;
import static io.openbas.utils.pagination.SortUtilsRuntime.computeSortRuntime;
import static io.openbas.utils.pagination.SortUtilsRuntime.toSortRuntime;

public class PaginationUtils {

  // -- RUNTIME --

  public static <T> Page<T> buildPaginationRuntime(List<T> values, SearchPaginationInput input) {
    int currentPage = input.getPage();
    int pageSize = input.getSize();
    int startItem = currentPage * pageSize;

    Pageable pageable = PageRequest.of(input.getPage(), input.getSize(), toSortRuntime(input.getSorts()));

    List<T> results = computePagination(values, input);
    int totalElements = results.size();

    // Offset
    if (startItem >= totalElements) {
      return new PageImpl<>(Collections.emptyList(), pageable, totalElements);
    }

    int toIndex = Math.min(startItem + pageSize, totalElements);
    List<T> paginatedContracts = results.subList(startItem, toIndex);
    return new PageImpl<>(paginatedContracts, pageable, totalElements);
  }

  private static <T> List<T> computePagination(List<T> values, SearchPaginationInput input) {
    return values
        .stream()
        .filter(computeFilterGroupRuntime(input.getFilterGroup()))
        .filter(computeSearchRuntime(input.getTextSearch()))
        .sorted(computeSortRuntime(input.getSorts()))
        .toList();
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

}
