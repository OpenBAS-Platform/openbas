package io.openex.player.specification;

import io.openex.player.model.database.Incident;
import io.openex.player.model.database.SubAudience;
import org.springframework.data.jpa.domain.Specification;

public class IncidentSpecification {

    public static Specification<Incident> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("event").get("exercise").get("id"), exerciseId);
    }
}
