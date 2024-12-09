package io.openbas.database.specification;

import io.openbas.database.model.InjectorContract;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class InjectorContractSpecification {

  private InjectorContractSpecification() {}

  public static Specification<InjectorContract> fromAttackPattern(String attackPatternId) {
    return (root, query, cb) -> cb.equal(root.get("attackPatterns").get("id"), attackPatternId);
  }

  public static Specification<InjectorContract> byPayloadId(final String payloadId) {
    if (payloadId == null || payloadId.isEmpty()) {
      throw new IllegalArgumentException("Payload ID must not be null or empty");
    }
    return (root, query, cb) -> {
      Join<Object, Object> payload = root.join("payload", JoinType.LEFT);
      return cb.equal(payload.get("id"), payloadId);
    };
  }

  public static Specification<InjectorContract> byPayloadExternalId(
      final String payloadExternalId) {
    if (payloadExternalId == null || payloadExternalId.isEmpty()) {
      throw new IllegalArgumentException("Payload external ID must not be null or empty");
    }
    return (root, query, cb) -> {
      Join<Object, Object> payload = root.join("payload", JoinType.LEFT);
      return cb.equal(payload.get("externalId"), payloadExternalId);
    };
  }
}
