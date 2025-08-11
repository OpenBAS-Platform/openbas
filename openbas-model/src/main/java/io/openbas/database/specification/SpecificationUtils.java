package io.openbas.database.specification;

import io.openbas.database.model.*;
import jakarta.persistence.criteria.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class SpecificationUtils {

  private SpecificationUtils() {}

  /**
   * Full Text Search with several properties instead of just one
   *
   * @param searchTerm the search term
   * @param properties the properties to check
   */
  public static <T extends Base> Specification<T> fullTextSearch(
      @NotBlank final String searchTerm,
      @NotBlank final List<String> properties,
      final boolean grantsFiltering,
      final String userId,
      final boolean isAdmin) {
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

      Predicate searchPredicate = cb.or(listOfPredicates.toArray(new Predicate[0]));

      // If filterUngranted is false, return just the search predicate
      if (isAdmin) {
        return searchPredicate;
      }

      // Add grant filtering
      // Create subquery to find all scenario IDs the user can access
      Subquery<String> accessibleScenarios = query.subquery(String.class);
      // We'll query from grants table
      Root<Grant> grantTable = accessibleScenarios.from(Grant.class);
      // Join to groups table (Grant has a 'group' field of type Group)
      Join<Grant, Group> groupTable = grantTable.join("group");
      // Join to users (Group has a 'users' collection)
      Join<Group, User> userTable = groupTable.join("users");
      // Join to scenario table (Grant has a 'scenario' field of type Scenario)
      Join<Grant, Scenario> scenarioTable = grantTable.join("scenario");
      // We want to SELECT the id from the joined Scenario entity
      // NOT from Grant directly since Grant doesn't have scenarioId
      accessibleScenarios.select(scenarioTable.get("id"));
      // WHERE the user in the join matches our userId
      accessibleScenarios.where(cb.equal(userTable.get("id"), userId));
      // Now use this subquery in main query
      // "Include only scenarios whose ID is in our subquery results"
      Predicate hasAccess = root.get("id").in(accessibleScenarios);

      // Combine with search predicate
      return cb.and(searchPredicate, hasAccess);
    };
  }
}
