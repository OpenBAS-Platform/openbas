package io.openbas.utils.pagination;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;

import static io.openbas.utils.pagination.FilterUtils.computeFilters;
import static io.openbas.utils.pagination.SearchUtils.computeSearch;
import static io.openbas.utils.pagination.SortUtils.computeSort;

public class PaginationUtils {


  public static <T> Page<T> buildPagination(List<T> values, Pageable pageable, PaginationField input) {
    int currentPage = pageable.getPageNumber();
    int pageSize = pageable.getPageSize();
    int startItem = currentPage * pageSize;

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

  private static <T> List<T> computePagination(List<T> values, PaginationField input) {
    return values
        .stream()
        .filter(computeFilters(input))
        .filter(computeSearch(input))
        .sorted(computeSort(input))
        .toList();
  }

}
