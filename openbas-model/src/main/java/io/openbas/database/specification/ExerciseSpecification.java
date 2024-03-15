package io.openbas.database.specification;

import io.openbas.database.model.Exercise;
import org.springframework.data.jpa.domain.Specification;

import static io.openbas.database.model.Exercise.STATUS.SCHEDULED;

public class ExerciseSpecification {

  public static Specification<Exercise> recurringInstanceNotStarted() {
    return (root, query, cb) -> cb.and(
        cb.equal(root.get("status"), SCHEDULED),
        cb.isNotNull(root.get("scenario"))
    );
  }

}
