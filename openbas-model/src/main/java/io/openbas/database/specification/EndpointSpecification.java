package io.openbas.database.specification;

import io.openbas.database.model.Endpoint;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

public class EndpointSpecification {

  private EndpointSpecification() {}

  public static Specification<Endpoint> findEndpointsForInjection() {
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.and(
            criteriaBuilder.isNull(root.get("agents").get("parent")),
            criteriaBuilder.isNull(root.get("agents").get("inject")));
  }

  public static Specification<Endpoint> findEndpointsForExecution() {
    return (root, query, criteriaBuilder) ->
        criteriaBuilder.or(
            criteriaBuilder.isNotNull(root.get("agents").get("parent")),
            criteriaBuilder.isNotNull(root.get("agents").get("inject")));
  }

  public static Specification<Endpoint> findEndpointsForInjectionByHostname(
      @NotBlank final String hostname) {
    Specification<Endpoint> hostnameSpec =
        (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("hostname"), hostname);
    return findEndpointsForInjection().and(hostnameSpec);
  }

  public static Specification<Endpoint> findEndpointsForExecutionByHostname(
      @NotBlank final String hostname) {
    Specification<Endpoint> hostnameSpec =
        (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("hostname"), hostname);
    return findEndpointsForExecution().and(hostnameSpec);
  }

  public static Specification<Endpoint> fromIds(@NotNull final List<String> ids) {
    return (root, query, builder) -> root.get("id").in(ids);
  }
}
