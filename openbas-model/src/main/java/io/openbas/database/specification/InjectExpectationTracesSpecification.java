package io.openbas.database.specification;

import io.openbas.database.model.InjectExpectationTrace;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public class InjectExpectationTracesSpecification {

  public static Specification<InjectExpectationTrace> afterAlertDate(@NotBlank final Instant date) {
    return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("alertDate"), date);
  }
}
