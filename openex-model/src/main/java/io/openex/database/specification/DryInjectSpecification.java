package io.openex.database.specification;

import io.openex.database.model.DryInject;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;

public class DryInjectSpecification {

    public static Specification<DryInject> executable() {
        return (root, query, cb) -> cb.isNull(root.join("status", JoinType.LEFT).get("name"));
    }
}
