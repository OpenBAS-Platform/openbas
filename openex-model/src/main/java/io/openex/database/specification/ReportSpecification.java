package io.openex.database.specification;

import io.openex.database.model.Report;
import org.springframework.data.jpa.domain.Specification;


public class ReportSpecification {

    public static Specification<Report> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }
}
