package io.openbas.database.specification;

import io.openbas.database.model.Endpoint;
import java.util.List;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

public class EndpointSpecification {

  private EndpointSpecification() {}

  public static Specification<Endpoint> findEndpointsForInjection() {
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.and(
            criteriaBuilder.isNull(root.get("parent")), criteriaBuilder.isNull(root.get("inject")));
  }

  public static Specification<Endpoint> findEndpointsForExecution() {
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.or(
            criteriaBuilder.isNotNull(root.get("parent")),
            criteriaBuilder.isNotNull(root.get("inject")));
  }

  public static Specification<Endpoint> fromIds(@NotNull final List<String> ids) {
    return (root, query, builder) -> root.get("id").in(ids);
  }
}
