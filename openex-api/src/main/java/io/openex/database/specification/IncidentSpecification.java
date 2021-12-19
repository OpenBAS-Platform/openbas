package io.openex.database.specification;

import io.openex.database.model.Incident;
import org.springframework.data.jpa.domain.Specification;

public class IncidentSpecification {

    public static Specification<Incident> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("event").get("exercise").get("id"), exerciseId);
    }
}
