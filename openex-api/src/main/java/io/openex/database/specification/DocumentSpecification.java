package io.openex.database.specification;

import io.openex.database.model.Document;
import org.springframework.data.jpa.domain.Specification;

public class DocumentSpecification {

    public static Specification<Document> onlyMinio() {
        return (root, query, cb) -> cb.equal(root.get("path"), "minio");
    }
}
