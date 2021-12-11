package io.openex.player.specification;

import io.openex.player.model.database.SubAudience;
import org.springframework.data.jpa.domain.Specification;

public class SubAudienceSpecification {

    public static Specification<SubAudience> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("audience").get("exercise").get("id"), exerciseId);
    }
}
