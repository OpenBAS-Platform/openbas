package io.openbas.database.specification;

import io.openbas.database.model.InjectorContract;
import jakarta.persistence.criteria.Path;
import org.springframework.data.jpa.domain.Specification;


public class InjectorContractSpecification {

    private InjectorContractSpecification() {

    }

    public static Specification<InjectorContract> fromAttackPattern(String attackPatternId) {
        return (root, query, cb) -> cb.equal(root.get("attackPatterns").get("id"), attackPatternId);
    }

    public static Specification<InjectorContract> fromKillChainPhase(String killChainPhaseId) {
        return (root, query, criteriaBuilder) -> {
            Path<Object> path = root.join("attackPatterns").join("killChainPhases").get("id");
            return criteriaBuilder.equal(path, killChainPhaseId);
        };
    }
}
