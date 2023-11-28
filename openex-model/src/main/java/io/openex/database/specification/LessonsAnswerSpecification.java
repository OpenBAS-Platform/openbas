package io.openex.database.specification;

import io.openex.database.model.LessonsAnswer;
import org.springframework.data.jpa.domain.Specification;

public class LessonsAnswerSpecification {

    public static Specification<LessonsAnswer> fromQuestion(String questionId) {
        return (root, query, cb) -> cb.equal(root.get("question").get("id"), questionId);
    }
}
