package io.openex.database.specification;

import io.openex.database.model.Log;
import org.springframework.data.jpa.domain.Specification;

public class ExerciseLogSpecification {

    public static Specification<Log> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }
}
