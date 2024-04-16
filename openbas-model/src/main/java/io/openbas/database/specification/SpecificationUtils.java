package io.openbas.database.specification;

import io.openbas.database.model.Base;
import jakarta.persistence.criteria.Expression;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.domain.Specification;

public class SpecificationUtils {

  public static <T extends Base> Specification<T> fullTextSearch(
      @NotBlank final String searchTerm,
      @NotBlank final String property) {
    return (root, query, cb) -> {

      Expression<Double> tsVector = cb.function("to_tsvector", Double.class, cb.literal("simple"), root.get(property));
      Expression<Double> tsQuery = cb.function("to_tsquery", Double.class, cb.literal("simple"), cb.literal(searchTerm));
      Expression<Double> rank = cb.function("ts_rank", Double.class, tsVector, tsQuery);
      query.orderBy(cb.desc(rank));

      return cb.greaterThan(rank, 0.0);

    };
  }

}
