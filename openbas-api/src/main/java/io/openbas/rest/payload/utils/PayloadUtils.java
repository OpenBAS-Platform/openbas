package io.openbas.rest.payload.utils;

import static java.util.Optional.ofNullable;

import io.openbas.database.model.Filters;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;

public class PayloadUtils {

  private static final String ARCHITECTURE_FILTER = "executable_arch";

  /** Manage filters that are not directly managed by the generic mechanics */
  public static SearchPaginationInput handleFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {

    Optional<Filters.Filter> payloadFilterOpt =
        ofNullable(searchPaginationInput.getFilterGroup())
            .flatMap(f -> f.findByKey(ARCHITECTURE_FILTER));

    if (payloadFilterOpt.isPresent()) {
      if (payloadFilterOpt.get().getValues().contains("x86_64")
          || (payloadFilterOpt.get().getValues().contains("arm64"))) {
        searchPaginationInput
            .getFilterGroup()
            .findByKey(ARCHITECTURE_FILTER)
            .get()
            .getValues()
            .add("All");
      }
    }

    return searchPaginationInput;
  }
}
