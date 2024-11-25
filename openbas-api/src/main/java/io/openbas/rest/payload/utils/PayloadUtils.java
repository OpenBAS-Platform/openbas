package io.openbas.rest.payload.utils;

import static java.util.Optional.ofNullable;

import io.openbas.database.model.Filters;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.Optional;
import org.jetbrains.annotations.NotNull;

public class PayloadUtils {

  private static final String PAYLOAD_EXECUTION_ARCH = "payload_execution_arch";
  private static final String INJECTOR_CONTRACT_ARCH = "injector_contract_arch";
  private static final String ALL = "ALL_ARCHITECTURES";

  public static SearchPaginationInput handleArchitectureFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {

    Optional<Filters.Filter> filterOpt =
        ofNullable(searchPaginationInput.getFilterGroup())
            .flatMap(
                f -> {
                  Optional<Filters.Filter> filter = f.findByKey(PAYLOAD_EXECUTION_ARCH);
                  if (filter.isPresent()) {
                    return filter;
                  } else {
                    return f.findByKey(INJECTOR_CONTRACT_ARCH);
                  }
                });

    filterOpt.ifPresent(
        payloadFilter -> {
          if (payloadFilter.getValues().contains("x86_64")
              || payloadFilter.getValues().contains("ARM64")) {
            payloadFilter.getValues().add(ALL);
          }
        });

    return searchPaginationInput;
  }
}
