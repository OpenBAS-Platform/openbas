package io.openbas.database.specification;

import io.openbas.database.model.LessonsTemplateCategory;
import org.springframework.data.jpa.domain.Specification;

public class LessonsTemplateCategorySpecification {

  public static Specification<LessonsTemplateCategory> fromTemplate(String templateId) {
    return (root, query, cb) -> cb.equal(root.get("template").get("id"), templateId);
  }
}
