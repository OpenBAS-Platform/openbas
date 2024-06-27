package io.openbas.database.criteria;

import io.openbas.database.model.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.domain.Specification;

public class InjectCriteria {

  private InjectCriteria() {

  }

  public static Long countQuery(
      @NotNull final CriteriaBuilder cb,
      @NotNull final EntityManager entityManager,
      Specification<Inject> specification) {
    CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
    Root<Inject> countRoot = countQuery.from(Inject.class);
    countQuery.select(cb.count(countRoot));
    if (specification != null) {
      Predicate predicate = specification.toPredicate(countRoot, countQuery, cb);
      if (predicate != null) {
        countQuery.where(predicate);
      }
    }
    return entityManager.createQuery(countQuery).getSingleResult();
  }

}
