package io.openbas.database.specification;

import io.openbas.database.model.Scenario;
import org.springframework.data.jpa.domain.Specification;

public class ScenarioSpecification {

  public static Specification<Scenario> recurring() {
    return (root, query, cb) -> cb.isNotNull(root.get("recurrence"));
  }

}
