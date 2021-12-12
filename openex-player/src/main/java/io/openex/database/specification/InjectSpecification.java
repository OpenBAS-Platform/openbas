package io.openex.database.specification;

import io.openex.database.model.Inject;
import io.openex.injects.manual.ManualContract;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;

public class InjectSpecification {

    public static Specification<Inject<?>> fromActiveExercise() {
        return (root, query, cb) -> cb.equal(root.get("incident")
                .get("event").get("exercise").get("canceled"), false);
    }

    public static Specification<Inject<?>> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("incident")
                .get("event").get("exercise").get("id"), exerciseId);
    }

    public static Specification<Inject<?>> fromEvent(String eventId) {
        return (root, query, cb) -> cb.equal(root.get("incident").get("event").get("id"), eventId);
    }

    public static Specification<Inject<?>> notManual() {
        return (root, query, cb) -> cb.notEqual(root.get("type"), ManualContract.NAME);
    }

    public static Specification<Inject<?>> notExecuted() {
        return (root, query, cb) -> cb.isNull(root.join("status", JoinType.LEFT).get("name"));
    }

    public static Specification<Inject<?>> isEnable() {
        return (root, query, cb) -> cb.equal(root.get("enabled"), true);
    }
}
