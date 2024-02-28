package io.openbas.database.specification;

import io.openbas.database.model.DryInject;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.JoinType;

public class DryInjectSpecification {

    public static Specification<DryInject> executable() {
        return (root, query, cb) -> cb.isNull(root.join("status", JoinType.LEFT).get("name"));
    }

    public static Specification<DryInject> fromDryRun(String dryrunId) {
        return (root, query, cb) -> cb.equal(root.get("run").get("id"), dryrunId);
    }
}
