package io.openbas.rest.injector_contract.utils;

import io.openbas.database.model.InjectorContract;
import io.openbas.utils.CustomFilterUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collections;
import java.util.Map;
import java.util.function.Function;

public class InjectorContractUtils {

  public static final String INJECTOR_CONTRACT_KILL_CHAIN_PHASES_FILTER = "injector_contract_kill_chain_phases";
  private static final Map<String, String> CORRESPONDENCE_MAP = Collections.singletonMap(
      INJECTOR_CONTRACT_KILL_CHAIN_PHASES_FILTER, "attackPatterns.killChainPhases.id"
  );

  private InjectorContractUtils() {

  }

  /**
   * Manage filters that are not directly managed by the generic mechanics -> injector_contract_kill_chain_phases
   */
  public static Function<Specification<InjectorContract>, Specification<InjectorContract>> handleCustomFilter(
      @NotNull final SearchPaginationInput searchPaginationInput) {
    return CustomFilterUtils.handleCustomFilter(
        searchPaginationInput,
        INJECTOR_CONTRACT_KILL_CHAIN_PHASES_FILTER,
        CORRESPONDENCE_MAP
    );
  }

}
