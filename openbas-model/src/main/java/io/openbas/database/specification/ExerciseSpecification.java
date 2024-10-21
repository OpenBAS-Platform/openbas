package io.openbas.database.specification;

import static io.openbas.database.model.ExerciseStatus.SCHEDULED;

import io.openbas.database.model.Exercise;
import jakarta.persistence.criteria.Path;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

public class ExerciseSpecification {

  private ExerciseSpecification() {}

  public static Specification<Exercise> recurringInstanceNotStarted() {
    return (root, query, cb) ->
        cb.and(cb.equal(root.get("status"), SCHEDULED), cb.isNotNull(root.get("scenario")));
  }

  public static Specification<Exercise> findGrantedFor(@NotNull final String userId) {
    return (root, query, cb) -> {
      Path<Object> path = root.join("grants").join("group").join("users").get("id");
      return cb.equal(path, userId);
    };
  }

  public static Specification<Exercise> fromScenario(@NotNull final String scenarioId) {
    return (root, query, cb) -> cb.equal(root.get("scenario").get("id"), scenarioId);
  }
}
