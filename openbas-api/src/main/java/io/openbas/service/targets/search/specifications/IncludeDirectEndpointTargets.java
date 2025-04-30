package io.openbas.service.targets.search.specifications;

import io.openbas.database.model.Asset;
import io.openbas.database.model.Endpoint;
import io.openbas.database.model.Inject;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class IncludeDirectEndpointTargets {
  public Specification<Endpoint> buildSpecification(Inject scopedInject) {
    return getDirectTargetingSpecification(scopedInject);
  }

  private Specification<Endpoint> getDirectTargetingSpecification(Inject scopedInject) {
    return (root, query, criteriaBuilder) -> {
      Subquery<Integer> subQuery = query.subquery(Integer.class);
      Root<Inject> injectTable = subQuery.from(Inject.class);
      Join<Inject, Asset> assetJoin = injectTable.join("assets");

      subQuery
          .select(criteriaBuilder.literal(1))
          .where(
              criteriaBuilder.equal(injectTable.get("id"), scopedInject.getId()),
              criteriaBuilder.equal(
                  assetJoin.get("id"), query.getRoots().stream().findFirst().get().get("id")));
      return criteriaBuilder.exists(subQuery);
    };
  }
}
