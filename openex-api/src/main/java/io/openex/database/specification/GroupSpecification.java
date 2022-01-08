package io.openex.database.specification;

import io.openex.database.model.Group;
import org.springframework.data.jpa.domain.Specification;

public class GroupSpecification {

    public static Specification<Group> defaultUserAssignable() {
        return (root, query, cb) -> cb.equal(root.get("defaultUserAssignation"), true);
    }
}
