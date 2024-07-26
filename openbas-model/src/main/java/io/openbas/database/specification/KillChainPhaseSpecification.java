package io.openbas.database.specification;

import io.openbas.database.model.KillChainPhase;
import jakarta.annotation.Nullable;
import org.springframework.data.jpa.domain.Specification;

public class KillChainPhaseSpecification {

  private KillChainPhaseSpecification() {

  }

  public static Specification<KillChainPhase> byName(@Nullable final String searchText) {
    return (root, query, cb) -> {
      if (searchText == null || searchText.isEmpty()) {
        return cb.conjunction();
      }
      String likePattern = "%" + searchText.toLowerCase() + "%";
      return cb.like(cb.lower(root.get("name")), likePattern);
    };
  }

}
