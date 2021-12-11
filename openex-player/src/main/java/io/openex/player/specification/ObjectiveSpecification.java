package io.openex.player.specification;

import io.openex.player.model.database.Objective;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;


public class ObjectiveSpecification {

    public static Specification<Objective> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }

    public static Specification<Objective> withExercise() {
        return (root, query, cb) -> {
            root.fetch("exercise", JoinType.LEFT);
            return cb.isNotNull(root.get("id"));
        };
    }
}
