package io.openex.player.specification;

import io.openex.player.model.database.SubObjective;
import org.springframework.data.jpa.domain.Specification;

public class SubObjectiveSpecification {

    public static Specification<SubObjective> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("objective").get("exercise").get("id"), exerciseId);
    }
}
