package io.openex.database.specification;

import io.openex.database.model.Objective;
import org.springframework.data.jpa.domain.Specification;


public class ObjectiveSpecification {

    public static Specification<Objective> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }
}
