package io.openbas.database.specification;

import io.openbas.database.model.Injector;
import jakarta.annotation.Nullable;
import org.springframework.data.jpa.domain.Specification;

public class InjectorSpecification {

  private InjectorSpecification() {

  }

  public static Specification<Injector> byName(@Nullable final String searchText) {
    return (root, query, cb) -> {
      if (searchText == null || searchText.isEmpty()) {
        return cb.conjunction();
      }
      String likePattern = "%" + searchText.toLowerCase() + "%";
      return cb.like(cb.lower(root.get("name")), likePattern);
    };
  }


}
