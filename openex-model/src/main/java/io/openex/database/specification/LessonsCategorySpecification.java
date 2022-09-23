package io.openex.database.specification;

import io.openex.database.model.LessonsCategory;
import org.springframework.data.jpa.domain.Specification;


public class LessonsCategorySpecification {

    public static Specification<LessonsCategory> fromExercise(String exerciseId) {
        return (root, query, cb) -> cb.equal(root.get("exercise").get("id"), exerciseId);
    }
}
