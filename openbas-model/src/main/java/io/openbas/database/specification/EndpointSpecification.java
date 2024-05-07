package io.openbas.database.specification;

import io.openbas.database.model.Endpoint;
import org.springframework.data.jpa.domain.Specification;

public class EndpointSpecification {

    public static Specification<Endpoint> findMainEndpoints() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isFalse(root.get("temporaryExecution"));
    }

    public static Specification<Endpoint> findTemporaryEndpoints() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("temporaryExecution"));
    }
}
