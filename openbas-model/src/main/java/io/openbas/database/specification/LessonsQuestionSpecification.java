package io.openbas.database.specification;

import io.openbas.database.model.LessonsQuestion;
import org.springframework.data.jpa.domain.Specification;

public class LessonsQuestionSpecification {

  public static Specification<LessonsQuestion> fromCategory(String categoryId) {
    return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
  }
}
