package io.openex.database.specification;

import io.openex.database.model.Poll;
import org.springframework.data.jpa.domain.Specification;


public class PollSpecification {

    public static Specification<Poll> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }
}
