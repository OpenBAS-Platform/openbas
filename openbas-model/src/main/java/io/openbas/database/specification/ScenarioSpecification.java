package io.openbas.database.specification;

import io.openbas.database.model.Scenario;
import jakarta.persistence.criteria.Path;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;

public class ScenarioSpecification {

  public static Specification<Scenario> isRecurring() {
    return (root, query, cb) -> cb.isNotNull(root.get("recurrence"));
  }

  public static Specification<Scenario> recurrenceStartDateAfter(@NotNull final Instant startDate) {
    return (root, query, cb) -> cb.or(
        cb.isNull(root.get("recurrenceStart")),
        cb.lessThanOrEqualTo(root.get("recurrenceStart"), startDate)
    );
  }

  public static Specification<Scenario> recurrenceStopDateBefore(@NotNull final Instant stopDate) {
    return (root, query, cb) -> cb.or(
        cb.isNull(root.get("recurrenceEnd")),
        cb.greaterThanOrEqualTo(root.get("recurrenceEnd"), stopDate)
    );
  }

  public static Specification<Scenario> findGrantedFor(String userId) {
    return (root, query, criteriaBuilder) -> {
      Path<Object> path = root
          .join("grants")
          .join("group")
          .join("users").get("id");
      return criteriaBuilder.equal(path, userId);
    };
  }

}
