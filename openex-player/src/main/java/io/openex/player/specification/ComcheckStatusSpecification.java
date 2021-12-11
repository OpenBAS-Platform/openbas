package io.openex.player.specification;

import io.openex.player.model.database.ComcheckStatus;
import org.springframework.data.jpa.domain.Specification;

public class ComcheckStatusSpecification {

    public static Specification<ComcheckStatus> fromComcheck(String comcheckId) {
        return (root, query, cb) -> cb.equal(root.get("comcheck").get("id"), comcheckId);
    }
}
