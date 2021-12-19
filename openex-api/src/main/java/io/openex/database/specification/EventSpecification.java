package io.openex.database.specification;

import io.openex.database.model.Event;
import org.springframework.data.jpa.domain.Specification;

public class EventSpecification {

    public static Specification<Event> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }
}
