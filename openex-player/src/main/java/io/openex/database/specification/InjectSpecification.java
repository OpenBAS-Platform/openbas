package io.openex.database.specification;

import io.openex.database.model.Inject;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.JoinType;


public class InjectSpecification {

    /*
    $exercises = $em->getRepository('App:Exercise')->findBy(['exercise_canceled' => 0]);
    ->leftJoin('i.inject_status', 's')
    ->where('s.status_inject = i.inject_id')
    ->andWhere('s.status_name is NULL')
    ->andWhere('i.inject_enabled = true')
    ->andWhere('i.inject_type != \'manual\'')
    ->andWhere('i.inject_incident = :incident')
    ->andWhere('i.inject_date BETWEEN :start AND :end')
    ->orderBy('i.inject_date', 'ASC')
    ->setParameter('incident', $incident->getIncidentId())
    ->setParameter('start', $dateStart->format('c'))
    ->setParameter('end', $dateEnd->format('c'))
     */

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
        return (root, query, cb) -> cb.notEqual(root.get("type"), "manual");
    }

    public static Specification<Inject<?>> notExecuted() {
        return (root, query, cb) -> cb.isNull(root.join("status", JoinType.LEFT).get("name"));
    }

    public static Specification<Inject<?>> isEnable() {
        return (root, query, cb) -> cb.equal(root.get("enabled"), true);
    }
}
