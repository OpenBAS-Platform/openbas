package io.openbas.database.specification;

import io.openbas.database.model.LessonsTemplateQuestion;
import org.springframework.data.jpa.domain.Specification;

public class LessonsTemplateQuestionSpecification {

  public static Specification<LessonsTemplateQuestion> fromCategory(String categoryId) {
    return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
  }
}
