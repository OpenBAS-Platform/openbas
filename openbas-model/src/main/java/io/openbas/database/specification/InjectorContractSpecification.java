package io.openbas.database.specification;

import io.openbas.database.model.InjectorContract;
import io.openbas.database.model.LessonsQuestion;
import org.springframework.data.jpa.domain.Specification;


public class InjectorContractSpecification {

    public static Specification<InjectorContract> fromAttackPattern(String attackPatternId) {
        return (root, query, cb) -> cb.equal(root.get("attackPatterns").get("id"), attackPatternId);
    }
}
