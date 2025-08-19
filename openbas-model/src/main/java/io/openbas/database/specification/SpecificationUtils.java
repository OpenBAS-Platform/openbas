package io.openbas.database.specification;

import io.openbas.database.model.*;
import jakarta.persistence.criteria.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

public class SpecificationUtils {

  private SpecificationUtils() {}

  /**
   * Full Text Search with several properties instead of just one
   *
   * @param searchTerm the search term
   * @param properties the properties to check
   * @param grantsFilterName the name of the entity field to fetch the grant for
   * @param userId ID of the user performing the search
   * @param isAdmin true id the user performing the search has admin privileges
   */
  public static <T extends Base> Specification<T> fullTextSearch(
      @NotBlank final String searchTerm,
      @NotBlank final List<String> properties,
      final String grantsFilterName,
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

      // If the user is an admin or there is no grant system associated
      if (isAdmin || StringUtils.isBlank(grantsFilterName)) {
        return searchPredicate;
      }

      // Add grant filtering
      // Create subquery to find all resource IDs the user can access
      Subquery<String> accessibleResources = query.subquery(String.class);
      // We'll query from grants table
      Root<Grant> grantTable = accessibleResources.from(Grant.class);
      // Join to groups table (Grant has a 'group' field of type Group)
      Join<Grant, Group> groupTable = grantTable.join("group");
      // Join to users (Group has a 'users' collection)
      Join<Group, User> userTable = groupTable.join("users");
      // Join to scenario table (Grant has a 'scenario' field of type Scenario)
      Join<Grant, ? extends Base> grantColumnTable = grantTable.join(grantsFilterName);
      // We want to SELECT the id from the joined Scenario entity
      // NOT from Grant directly since Grant doesn't have scenarioId
      accessibleResources.select(grantColumnTable.get("id"));
      // WHERE the user in the join matches our userId
      accessibleResources.where(cb.equal(userTable.get("id"), userId));
      // Now use this subquery in main query
      // "Include only scenarios whose ID is in our subquery results"
      Predicate hasAccess = root.get("id").in(accessibleResources);

      // Combine with search predicate
      return cb.and(searchPredicate, hasAccess);
    };
  }
}
