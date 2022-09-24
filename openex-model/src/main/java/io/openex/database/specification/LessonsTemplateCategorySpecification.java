package io.openex.database.specification;

import io.openex.database.model.LessonsTemplateCategory;
import org.springframework.data.jpa.domain.Specification;


public class LessonsTemplateCategorySpecification {

    public static Specification<LessonsTemplateCategory> fromTemplate(String templateId) {
        return (root, query, cb) -> cb.equal(root.get("template").get("id"), templateId);
    }
}
