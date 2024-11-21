package io.openbas.utils;

import static java.util.Optional.ofNullable;

import io.openbas.database.model.Filters;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;

public class ArchitectureUtils {

  private static final String EXECUTABLE_ARCH = "executable_arch";
  private static final String ENDPOINT_ARCH = "endpoint_arch";
  public static final String ALL = "All";

  public static SearchPaginationInput handlePayloadFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {

    Optional<Filters.Filter> payloadFilterOpt =
        ofNullable(searchPaginationInput.getFilterGroup())
            .flatMap(f -> f.findByKey(EXECUTABLE_ARCH));

    if (payloadFilterOpt.isPresent()) {
      if (payloadFilterOpt.get().getValues().contains("x86_64")
          || (payloadFilterOpt.get().getValues().contains("arm64"))) {
        searchPaginationInput
            .getFilterGroup()
            .findByKey(EXECUTABLE_ARCH)
            .get()
            .getValues()
            .add(ALL);
      }
    }

    return searchPaginationInput;
  }

  public static SearchPaginationInput handleEndpointFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {

    Optional<Filters.Filter> endpointFilterOpt =
        ofNullable(searchPaginationInput.getFilterGroup()).flatMap(f -> f.findByKey(ENDPOINT_ARCH));

    if (endpointFilterOpt.isPresent()) {
      if (endpointFilterOpt.get().getValues().contains(ALL)) {
        searchPaginationInput
            .getFilterGroup()
            .findByKey(ENDPOINT_ARCH)
            .get()
            .getValues()
            .remove(ALL);
      }
    }

    return searchPaginationInput;
  }
}
