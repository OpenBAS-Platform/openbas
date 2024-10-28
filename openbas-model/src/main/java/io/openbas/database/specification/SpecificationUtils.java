package io.openbas.database.specification;

import io.openbas.database.model.Base;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class SpecificationUtils {

  /**
   * Full Text Search with several properties instead of just one
   *
   * @param searchTerm the search term
   * @param properties the properties to check
   */
  public static <T extends Base> Specification<T> fullTextSearch(
      @NotBlank final String searchTerm, @NotBlank final List<String> properties) {
    return (root, query, cb) -> {
      List<Predicate> listOfPredicates = new ArrayList<>();
      for (String property : properties) {
        Expression<Double> tsVector =
            cb.function("to_tsvector", Double.class, cb.literal("simple"), root.get(property));
        Expression<Double> tsQuery =
            cb.function("to_tsquery", Double.class, cb.literal("simple"), cb.literal(searchTerm));
        Expression<Double> rank = cb.function("ts_rank", Double.class, tsVector, tsQuery);
        query.orderBy(cb.desc(rank));
        listOfPredicates.add(cb.greaterThan(rank, 0.01));
      }

      return cb.or(listOfPredicates.toArray(new Predicate[0]));
    };
  }
}
