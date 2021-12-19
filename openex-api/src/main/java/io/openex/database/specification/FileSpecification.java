package io.openex.database.specification;

import io.openex.database.model.File;
import org.springframework.data.jpa.domain.Specification;

public class FileSpecification {

    public static Specification<File> onlyMinio() {
        return (root, query, cb) -> cb.equal(root.get("path"), "minio");
    }
}
