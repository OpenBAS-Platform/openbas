package io.openex.database.specification;

import io.openex.database.model.Inject;
import io.openex.injects.manual.ManualContract;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;

public class InjectSpecification {

    public static <T> Specification<Inject<T>> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("incident")
                .get("event").get("exercise").get("id"), exerciseId);
    }

    public static <T> Specification<Inject<T>> fromEvent(String eventId) {
        return (root, query, cb) -> cb.equal(root.get("incident").get("event").get("id"), eventId);
    }

    public static <T> Specification<Inject<T>> executable() {
        return (root, query, cb) -> cb.and(
                cb.notEqual(root.get("type"), ManualContract.NAME),  // notManual
                cb.equal(root.get("enabled"), true), // isEnable
                cb.equal(root.get("incident").get("event").get("exercise").get("canceled"), false), // fromActiveExercise
                cb.isNull(root.join("status", JoinType.LEFT).get("name")) // notExecuted
        );
    }

    public static <T> Specification<Inject<T>> forDryrun(String exerciseId) {
        return (root, query, cb) -> cb.and(
                cb.notEqual(root.get("type"), ManualContract.NAME),  // notManual
                cb.equal(root.get("enabled"), true), // isEnable
                cb.equal(root.get("incident").get("event").get("exercise").get("id"), exerciseId) // fromActiveExercise
        );
    }
}
