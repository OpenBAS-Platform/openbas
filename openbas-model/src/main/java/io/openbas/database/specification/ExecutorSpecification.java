package io.openbas.database.specification;

import io.openbas.database.model.Executor;
import jakarta.annotation.Nullable;
import org.springframework.data.jpa.domain.Specification;

public class ExecutorSpecification {
  public static Specification<Executor> byName(@Nullable final String searchText) {
    return UtilsSpecification.byName(searchText, "name");
  }
}
