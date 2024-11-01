package io.openbas.database.specification;

import io.openbas.database.model.Dryrun;
import org.springframework.data.jpa.domain.Specification;

public class DryRunSpecification {

  public static Specification<Dryrun> id(String dryRunId) {
    return (root, query, cb) -> cb.equal(root.get("id"), dryRunId);
  }

  public static Specification<Dryrun> fromExercise(String exerciseId) {
    return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
  }
}
