package io.openex.database.specification;

import io.openex.database.model.DryInject;
import io.openex.injects.manual.ManualContract;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;

public class DryInjectSpecification {

    public static <T> Specification<DryInject<T>> executable() {
        return (root, query, cb) -> cb.and(
                cb.notEqual(root.get("type"), ManualContract.NAME),
                cb.isNull(root.join("status", JoinType.LEFT).get("name"))
        );
    }
}
