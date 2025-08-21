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

  /**
   * Specification to filter entities based on user grants. Usage:
   * myResourceSearchSpecification.and(SpecificationUtils.hasGrantAccess(grantsFilterName, userId,
   * isAdmin)) Only works for entities that have the @Grantable annotation, return cb.conjunction()
   * otherwise.
   *
   * @param userId ID of the user performing the search
   * @param isAdmin true id the user performing the search has admin privileges
   * @param grantType the minimum grant type required to access the resource
   */
  public static <T extends Base> Specification<T> hasGrantAccess(
      final String userId, final boolean isAdmin, Grant.GRANT_TYPE grantType) {
    return (root, query, cb) -> {
      Class<?> entityClass = root.getJavaType();

      // Check if the entity has the @GrantFilter annotation
      Grantable grantFilter = entityClass.getAnnotation(Grantable.class);

      // If the user is an admin or there is no grant system associated
      if (isAdmin || grantFilter == null) {
        return cb.conjunction(); // Always true
      }

      List<Grant.GRANT_TYPE> allowedGrantTypes = grantType.andHigher();

      // Add grant filtering
      // Create subquery to find all resource IDs the user can access
      Subquery<String> accessibleResources = query.subquery(String.class);
      // We'll query from grants table
      Root<Grant> grantTable = accessibleResources.from(Grant.class);
      // Join to groups table (Grant has a 'group' field of type Group)
      Join<Grant, Group> groupTable = grantTable.join("group");
      // Join to users (Group has a 'users' collection)
      Join<Group, User> userTable = groupTable.join("users");
      // Join to the resource table (Grant class has a '{resource}' field of type ResourceType)
      Join<Grant, ? extends Base> grantColumnTable = grantTable.join(grantFilter.grantFieldName());
      // We want to SELECT the id from the joined Scenario entity
      // NOT from Grant directly since Grant doesn't have resource ID
      accessibleResources.select(grantColumnTable.get("id"));
      // WHERE the user in the join matches our userId AND grant name is of the given value
      accessibleResources.where(
          cb.and(
              cb.equal(userTable.get("id"), userId), grantTable.get("name").in(allowedGrantTypes)));
      // Now use this subquery in main query
      // "Include only scenarios whose ID is in our subquery results"
      return root.get("id").in(accessibleResources);
    };
  }

  /**
   * Creates a subquery that returns all scenario IDs that the user has access to through grants.
   *
   * @param query The parent criteria query used to create the subquery
   * @param cb The criteria builder for constructing query predicates
   * @param userId The ID of the user whose accessible scenario are being queried
   * @param allowedGrantTypes List of grant types that provide access (e.g., OBSERVER and higher)
   * @return A subquery that selects exercise IDs the user can access
   */
  public static Subquery<String> accessibleScenariosSubquery(
      CriteriaQuery<?> query,
      CriteriaBuilder cb,
      String userId,
      List<Grant.GRANT_TYPE> allowedGrantTypes) {

    Subquery<String> accessibleScenarios = query.subquery(String.class);
    Root<Grant> grantTable = accessibleScenarios.from(Grant.class);
    Join<Grant, Group> groupTable = grantTable.join("group");
    Join<Group, User> userTable = groupTable.join("users");
    Join<Grant, Scenario> scenarioTable = grantTable.join("scenario");

    // Select scenario ID from the joined scenario
    accessibleScenarios.select(scenarioTable.get("id"));

    // WHERE user matches AND grant type is allowed
    accessibleScenarios.where(
        cb.and(
            cb.equal(userTable.get("id"), userId), grantTable.get("name").in(allowedGrantTypes)));

    return accessibleScenarios;
  }

  /**
   * Creates a subquery that returns all simulation IDs that the user has access to through grants.
   *
   * @param query The parent criteria query used to create the subquery
   * @param cb The criteria builder for constructing query predicates
   * @param userId The ID of the user whose accessible simulations are being queried
   * @param allowedGrantTypes List of grant types that provide access (e.g., OBSERVER and higher)
   * @return A subquery that selects exercise IDs the user can access
   */
  public static Subquery<String> accessibleSimulationsSubquery(
      CriteriaQuery<?> query,
      CriteriaBuilder cb,
      String userId,
      List<Grant.GRANT_TYPE> allowedGrantTypes) {

    Subquery<String> accessibleExercises = query.subquery(String.class);
    Root<Grant> grantTable = accessibleExercises.from(Grant.class);
    Join<Grant, Group> groupTable = grantTable.join("group");
    Join<Group, User> userTable = groupTable.join("users");
    Join<Grant, Exercise> exerciseTable = grantTable.join("exercise");

    // Select exercise ID from the joined exercise
    accessibleExercises.select(exerciseTable.get("id"));

    // WHERE user matches AND grant type is allowed
    accessibleExercises.where(
        cb.and(
            cb.equal(userTable.get("id"), userId), grantTable.get("name").in(allowedGrantTypes)));

    return accessibleExercises;
  }
}
