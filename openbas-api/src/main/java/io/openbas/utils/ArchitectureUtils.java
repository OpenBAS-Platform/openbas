package io.openbas.utils;

import static java.util.Optional.ofNullable;

import io.openbas.database.model.Filters;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;

public class ArchitectureUtils {

  private static final String EXECUTABLE_ARCH = "executable_arch";
  private static final String INJECTOR_CONTRACT_ARCH = "injector_contract_arch";
  private static final String ENDPOINT_ARCH = "endpoint_arch";
  public static final String ALL = "All";

  public static SearchPaginationInput handleArchitectureFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {

    Optional<Filters.Filter> filterOpt =
        ofNullable(searchPaginationInput.getFilterGroup())
            .flatMap(
                f -> {
                  Optional<Filters.Filter> filter = f.findByKey(EXECUTABLE_ARCH);
                  if (filter.isPresent()) {
                    return filter;
                  } else {
                    return f.findByKey(INJECTOR_CONTRACT_ARCH);
                  }
                });

    filterOpt.ifPresent(
        payloadFilter -> {
          if (payloadFilter.getValues().contains("x86_64")
              || payloadFilter.getValues().contains("arm64")) {
            payloadFilter.getValues().add(ALL);
          }
        });

    return searchPaginationInput;
  }

  public static SearchPaginationInput handleEndpointFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {

    Optional<Filters.Filter> endpointFilterOpt =
        ofNullable(searchPaginationInput.getFilterGroup()).flatMap(f -> f.findByKey(ENDPOINT_ARCH));

    endpointFilterOpt.ifPresent(
        endpointFilter -> {
          if (endpointFilter.getValues().contains(ALL)) {
            endpointFilter.getValues().remove(ALL);
          }
          if (endpointFilter.getValues().isEmpty()) {
            searchPaginationInput.getFilterGroup().removeByKey(ENDPOINT_ARCH);
          }
        });

    return searchPaginationInput;
  }
}
