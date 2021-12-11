package io.openex.player.specification;

import io.openex.player.model.database.DryInject;
import org.springframework.data.jpa.domain.Specification;

import java.time.Duration;
import java.util.Date;


public class DryInjectSpecification {

    /*
        $dryinjects = $em->getRepository('App:Dryinject')->createQueryBuilder('i')
            ->leftJoin('i.dryinject_status', 's')
            ->where('s.status_dryinject = i.dryinject_id')
            ->andWhere('s.status_name is NULL')
            ->andWhere('i.dryinject_type != \'other\'')
            ->andWhere('i.dryinject_date BETWEEN :start AND :end')
            ->orderBy('i.dryinject_date', 'ASC')
            ->setParameter('start', $dateStart->format('c'))
            ->setParameter('end', $dateEnd->format('c'))
     */
    public static Specification<DryInject<?>> inLastHour() {
        return (root, query, cb) -> {
            Date end = new Date();
            Date start = Date.from(end.toInstant().minus(Duration.parse("-PT1H")));
            return cb.and(cb.greaterThan(root.get("date"), start), cb.lessThan(root.get("date"), end));
        };
    }

    public static Specification<DryInject<?>> notManual() {
        return (root, query, cb) -> cb.notEqual(root.get("type"), "manual");
    }

    public static Specification<DryInject<?>> notExecuted() {
        return (root, query, cb) -> cb.isNull(root.get("status").get("name"));
    }
}
