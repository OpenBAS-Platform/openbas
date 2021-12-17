package io.openex.database.specification;

import io.openex.database.model.SubObjective;
import org.springframework.data.jpa.domain.Specification;

public class SubObjectiveSpecification {

    public static Specification<SubObjective> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("objective").get("exercise").get("id"), exerciseId);
    }
}
