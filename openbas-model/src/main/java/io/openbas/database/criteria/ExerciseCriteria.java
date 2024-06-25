package io.openbas.database.criteria;

import io.openbas.database.model.Exercise;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import org.jetbrains.annotations.NotNull;

public class ExerciseCriteria {

  private ExerciseCriteria() {

  }

  public static Long countQuery(
      @NotNull final CriteriaBuilder cb,
      @NotNull final EntityManager entityManager) {
    CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
    Root<Exercise> countRoot = countQuery.from(Exercise.class);
    countQuery.select(cb.count(countRoot));
    return entityManager.createQuery(countQuery).getSingleResult();
  }

}
