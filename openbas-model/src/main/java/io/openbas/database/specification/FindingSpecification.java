package io.openbas.database.specification;

import io.openbas.database.model.Finding;
import jakarta.persistence.criteria.*;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

public class FindingSpecification {

  private FindingSpecification() {}

  public static Specification<Finding> findFindingsForInject(@NotNull final String injectId) {
    return (root, query, cb) -> cb.equal(root.get("inject").get("id"), injectId);
  }

  public static Specification<Finding> findFindingsForSimulation(
      @NotNull final String simulationId) {
    return (root, query, cb) ->
        cb.equal(root.get("inject").get("exercise").get("id"), simulationId);
  }

  public static Specification<Finding> findFindingsForScenario(@NotNull final String scenarioId) {
    return (root, query, cb) ->
        cb.equal(root.get("inject").get("exercise").get("scenario").get("id"), scenarioId);
  }

  public static Specification<Finding> findFindingsForEndpoint(@NotNull final String endpointId) {
    return (root, query, cb) -> cb.equal(root.get("assets").get("id"), endpointId);
  }

  public static Specification<Finding> forLatestSimulations() {
    return (root, query, cb) -> {
      Join<?, ?> injectJoin = root.join("inject", JoinType.INNER);
      Join<?, ?> exerciseJoin1 = injectJoin.join("exercise", JoinType.LEFT);
      Join<?, ?> exerciseJoin2 =
          exerciseJoin1.join("scenario", JoinType.LEFT).join("exercises", JoinType.LEFT);

      exerciseJoin2.on(
          cb.and(
              cb.equal(
                  exerciseJoin1.get("scenario").get("id"), exerciseJoin2.get("scenario").get("id")),
              cb.lessThan(exerciseJoin1.get("createdAt"), exerciseJoin2.get("createdAt"))));

      return cb.isNull(exerciseJoin2.get("id"));
    };
  }
}
