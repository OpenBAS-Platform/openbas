package io.openbas.database.specification;

import io.openbas.database.model.Endpoint;
import org.springframework.data.jpa.domain.Specification;

public class EndpointSpecification {
    public static Specification<Endpoint> findEndpointsForInjection() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isNull(root.get("parent"));
    }

    public static Specification<Endpoint> findEndpointsForExecution() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isNotNull(root.get("parent"));
    }
}
