package io.openbas.database.specification;

import io.openbas.database.model.Scenario;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public class ScenarioSpecification {

  public static Specification<Scenario> recurring() {
    return (root, query, cb) -> cb.isNotNull(root.get("recurrence"));
  }

  public static Specification<Scenario> recurringStartDate(@NotNull final Instant startDate) {
    return (root, query, cb) -> cb.or(
        cb.isNull(root.get("recurrenceStart")),
        cb.greaterThanOrEqualTo(root.get("recurrenceStart"), startDate)
    );
  }

  public static Specification<Scenario> recurringStopDate(@NotNull final Instant stopDate) {
    return (root, query, cb) -> cb.or(
        cb.isNull(root.get("recurrenceEnd")),
        cb.lessThanOrEqualTo(root.get("recurrenceEnd"), stopDate)
    );
  }

}
