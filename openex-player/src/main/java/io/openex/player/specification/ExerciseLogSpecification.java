package io.openex.player.specification;

import io.openex.player.model.database.ExerciseLog;
import org.springframework.data.jpa.domain.Specification;

public class ExerciseLogSpecification {

    public static Specification<ExerciseLog> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }
}
