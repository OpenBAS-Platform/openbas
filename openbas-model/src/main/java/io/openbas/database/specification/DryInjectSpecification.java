package io.openbas.database.specification;

import io.openbas.database.model.DryInject;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class DryInjectSpecification {

  public static Specification<DryInject> executable() {
    return (root, query, cb) -> cb.isNull(root.join("status", JoinType.LEFT).get("name"));
  }

  public static Specification<DryInject> fromDryRun(String dryrunId) {
    return (root, query, cb) -> cb.equal(root.get("run").get("id"), dryrunId);
  }
}
