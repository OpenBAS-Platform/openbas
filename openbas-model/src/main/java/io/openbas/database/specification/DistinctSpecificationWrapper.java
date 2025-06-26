package io.openbas.database.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

public class DistinctSpecificationWrapper<T> implements Specification<T> {

  private final Specification<T> delegate;

  public DistinctSpecificationWrapper(Specification<T> delegate) {
    this.delegate = delegate;
  }

  @Override
  public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
    query.distinct(true);
    return delegate == null ? null : delegate.toPredicate(root, query, cb);
  }
}
