package io.openbas.database.specification;

import io.openbas.database.model.AttackPattern;
import org.springframework.data.jpa.domain.Specification;


public class AttackPatternSpecification {

    public static Specification<AttackPattern> fromAttackPattern(String attackPatternId) {
        return (root, query, cb) -> cb.equal(root.get("attackPatterns").get("id"), attackPatternId);
    }
}
