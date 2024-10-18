package io.openbas.rest.asset.endpoint;

import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.rest.asset.endpoint.EndpointQueryHelper.execution;
import static io.openbas.rest.asset.endpoint.EndpointQueryHelper.select;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationCriteriaBuilder;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.Endpoint;
import io.openbas.rest.asset.endpoint.form.EndpointOutput;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class EndpointCriteriaBuilderService {

  @Resource protected ObjectMapper mapper;

  @PersistenceContext private EntityManager entityManager;

  public Page<EndpointOutput> endpointPagination(
      @NotNull SearchPaginationInput searchPaginationInput) {
    return buildPaginationCriteriaBuilder(this::paginate, searchPaginationInput, Endpoint.class);
  }

  public List<EndpointOutput> find(Specification<Endpoint> specification) {
    CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<Endpoint> root = cq.from(Endpoint.class);
    select(cb, cq, root);

    if (specification != null) {
      Predicate predicate = specification.toPredicate(root, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    TypedQuery<Tuple> query = entityManager.createQuery(cq);
    return execution(query, this.mapper);
  }

  // -- PRIVATE --

  private Page<EndpointOutput> paginate(
      Specification<Endpoint> specification,
      Specification<Endpoint> specificationCount,
      Pageable pageable) {
    CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<Endpoint> endpointRoot = cq.from(Endpoint.class);
    select(cb, cq, endpointRoot);

    // -- Specification --
    if (specification != null) {
      Predicate predicate = specification.toPredicate(endpointRoot, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    // -- Sorting --
    List<Order> orders = toSortCriteriaBuilder(cb, endpointRoot, pageable.getSort());
    cq.orderBy(orders);

    // Type Query
    TypedQuery<Tuple> query = entityManager.createQuery(cq);

    // -- Pagination --
    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());

    // -- EXECUTION --
    List<EndpointOutput> endpoints = execution(query, this.mapper);

    // -- Count Query --
    Long total = countQuery(cb, this.entityManager, Endpoint.class, specificationCount);

    return new PageImpl<>(endpoints, pageable, total);
  }
}
