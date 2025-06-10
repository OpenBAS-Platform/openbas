package io.openbas.database.specification;

import io.openbas.database.model.InjectTestExecution;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import org.springframework.data.jpa.domain.Specification;

public class InjectTestSpecification {

  public static Specification<InjectTestExecution> findInjectTestInExercise(String exerciseId) {

    return (root, query, criteriaBuilder) -> {
      Path<Object> path =
          root.join("inject", JoinType.INNER).join("exercise", JoinType.INNER).get("id");
      return criteriaBuilder.equal(path, exerciseId);
    };
  }

  public static Specification<InjectTestExecution> findInjectTestInScenario(String scenarioId) {

    return (root, query, criteriaBuilder) -> {
      Path<Object> path =
          root.join("inject", JoinType.INNER).join("scenario", JoinType.INNER).get("id");
      return criteriaBuilder.equal(path, scenarioId);
    };
  }
}
