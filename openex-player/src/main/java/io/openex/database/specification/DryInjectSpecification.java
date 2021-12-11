package io.openex.database.specification;

import io.openex.database.model.DryInject;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Path;
import java.time.Duration;
import java.util.Date;

public class DryInjectSpecification {

    public static Specification<DryInject<?>> notManual() {
        return (root, query, cb) -> cb.notEqual(root.get("type"), "manual");
    }

    public static Specification<DryInject<?>> notExecuted() {
        return (root, query, cb) -> cb.isNull(root.join("status", JoinType.LEFT).get("name"));
    }
}
