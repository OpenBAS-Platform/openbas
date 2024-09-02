package io.openbas.database.specification;

import io.openbas.database.model.ExecutionStatus;
import io.openbas.database.model.ExerciseStatus;
import io.openbas.database.model.Inject;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.domain.Specification;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class InjectSpecification {

    private InjectSpecification() {

    }

    public static Specification<Inject> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }

    public static Specification<Inject> fromScenario(String scenarioId) {
        return (root, query, cb) -> cb.equal(root.get("scenario").get("id"), scenarioId);
    }

    public static Specification<Inject> next() {
        return (root, query, cb) -> {
            Path<Object> exercisePath = root.get("exercise");
            return cb.and(
                    cb.equal(root.get("enabled"), true), // isEnable
                    cb.isNotNull(exercisePath.get("start")), // fromScheduled
                    cb.isNull(root.join("status", JoinType.LEFT).get("name")) // notExecuted
            );
        };
    }

    public static Specification<Inject> executable() {
        return (root, query, cb) -> {
            Path<Object> exercisePath = root.get("exercise");
            return cb.and(
                    // cb.notEqual(root.get("type"), ManualContract.TYPE),  // notManual
                    cb.equal(root.get("enabled"), true), // isEnable
                    cb.isNotNull(exercisePath.get("start")), // fromScheduled
                    cb.equal(exercisePath.get("status"), ExerciseStatus.RUNNING), // fromRunningExercise
                    cb.isNull(root.join("status", JoinType.LEFT).get("name")) // notExecuted
            );
        };
    }

    public static Specification<Inject> forDryrun(String exerciseId) {
        return (root, query, cb) -> cb.and(
                // cb.notEqual(root.get("type"), ManualContract.TYPE),  // notManual
                cb.equal(root.get("enabled"), true), // isEnable
                cb.equal(root.get("exercise").get("id"), exerciseId) // fromWantedExercise
        );
    }

    public static Specification<Inject> forAtomicTesting() {
        return (root, query, cb) -> cb.and(
                cb.isNull(root.get("exercise")), // No exercise
                cb.isNull(root.get("scenario")), // No scenario
                cb.equal(root.get("status").get("name"), ExecutionStatus.QUEUING),
                cb.notEqual(root.get("status").get("name"), ExecutionStatus.PENDING)
        );
    }

    public static Specification<Inject> fromContract(@NotBlank final String contract) {
        return (root, query, cb) -> cb.equal(root.get("injectorContract").get("id"), contract);
    }

    public static final Set<String> VALID_TESTABLE_TYPES = new HashSet<>(
        Arrays.asList("openbas_email", "openbas_ovh_sms")
    );

    public static Specification<Inject> byIds(List<String> injectIds) {
        return (root, query, cb) -> root.get("id").in(injectIds);
    }

    public static Specification<Inject> testable() {
        return (root, query, cb) -> root.get("injectorContract").get("injector").get("type").in(VALID_TESTABLE_TYPES);
    }

}
