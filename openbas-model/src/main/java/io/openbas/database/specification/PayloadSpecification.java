package io.openbas.database.specification;

import io.openbas.database.model.Payload;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

public class PayloadSpecification {

  public static Specification<Payload> latestVersions() {
    return (Root<Payload> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
      assert query != null;
      Subquery<Integer> subquery = query.subquery(Integer.class);
      Root<Payload> subRoot = subquery.from(Payload.class);

      subquery.select(cb.max(subRoot.get("version")))
          .where(cb.equal(subRoot.get("externalId"), root.get("externalId")));

      return cb.equal(root.get("version"), subquery);
    };
  }

}
