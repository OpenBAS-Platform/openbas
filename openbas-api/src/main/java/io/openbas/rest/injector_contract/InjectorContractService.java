package io.openbas.rest.injector_contract;

import io.openbas.database.model.*;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.injectors.email.EmailContract;
import io.openbas.injectors.email.EmailInjector;
import io.openbas.injectors.ovh.OvhSmsContract;
import io.openbas.rest.injector_contract.output.InjectorContractOutput;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.JpaUtils.createLeftJoin;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;

@RequiredArgsConstructor
@Service
public class InjectorContractService {

  @PersistenceContext
  private EntityManager entityManager;

  private final InjectorContractRepository injectorContractRepository;

  @Value("${openbas.xls.import.mail.enable}")
  private boolean mailImportEnabled;

  @Value("${openbas.xls.import.sms.enable}")
  private boolean smsImportEnabled;

  @EventListener(ApplicationReadyEvent.class)
  public void initImportAvailableOnStartup() {
    List<String> listOfInjectorImportAvailable = new ArrayList<>();
    if (mailImportEnabled) listOfInjectorImportAvailable.addAll(Arrays.asList(EmailContract.EMAIL_GLOBAL, EmailContract.EMAIL_DEFAULT));
    if (smsImportEnabled) listOfInjectorImportAvailable.add(OvhSmsContract.OVH_DEFAULT);

    List<InjectorContract> listInjectorContract = new ArrayList<>();
    injectorContractRepository.findAll().spliterator().forEachRemaining(listInjectorContract::add);
    listInjectorContract.forEach(injectorContract -> {
        injectorContract.setImportAvailable(listOfInjectorImportAvailable.contains(injectorContract.getId()));
    });
    injectorContractRepository.saveAll(listInjectorContract);
  }

  public Page<InjectorContractOutput> injectorContracts(
      @Nullable final Specification<InjectorContract> specification,
      @NotNull final Pageable pageable) {
    CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<InjectorContract> injectorContractRoot = cq.from(InjectorContract.class);
    selectForInjectorContract(cb, cq, injectorContractRoot);

    // -- Text Search and Filters --
    if (specification != null) {
      Predicate predicate = specification.toPredicate(injectorContractRoot, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    // -- Sorting --
    List<Order> orders = toSortCriteriaBuilder(cb, injectorContractRoot, pageable.getSort());
    cq.orderBy(orders);

    // Type Query
    TypedQuery<Tuple> query = this.entityManager.createQuery(cq);

    // -- Pagination --
    query.setFirstResult((int) pageable.getOffset());
    query.setMaxResults(pageable.getPageSize());

    // -- EXECUTION --
    List<InjectorContractOutput> injectorContractOutputs = execInjectorContract(query);

    // -- Count Query --
    Long total = countQuery(cb, this.entityManager, InjectorContract.class, specification);

    return new PageImpl<>(injectorContractOutputs, pageable, total);
  }


  // -- CRITERIA BUILDER --

  private void selectForInjectorContract(
      @NotNull final CriteriaBuilder cb,
      @NotNull final CriteriaQuery<Tuple> cq,
      @NotNull final Root<InjectorContract> injectorContractRoot) {
    // Joins
    Join<InjectorContract, Payload> injectorContractPayloadJoin = createLeftJoin(injectorContractRoot, "payload");
    Join<Payload, Collector> payloadCollectorJoin = injectorContractPayloadJoin.join("collector", JoinType.LEFT);
    Join<InjectorContract, Injector> injectorContractInjectorJoin = createLeftJoin(injectorContractRoot, "injector");
    // Array aggregations
    Expression<String[]> attackPatternIdsExpression = createJoinArrayAggOnId(cb, injectorContractRoot, "attackPatterns");

    // SELECT
    cq.multiselect(
        injectorContractRoot.get("id").alias("injector_contract_id"),
        injectorContractRoot.get("labels").alias("injector_contract_labels"),
        injectorContractRoot.get("content").alias("injector_contract_content"),
        injectorContractRoot.get("platforms").alias("injector_contract_platforms"),
        injectorContractPayloadJoin.get("type").alias("payload_type"),
        payloadCollectorJoin.get("type").alias("collector_type"),
        injectorContractInjectorJoin.get("type").alias("injector_contract_injector_type"),
        attackPatternIdsExpression.alias("injector_contract_attack_patterns")
    ).distinct(true);

    // GROUP BY
    cq.groupBy(Arrays.asList(
        injectorContractRoot.get("id"),
        injectorContractPayloadJoin.get("id"),
        payloadCollectorJoin.get("id"),
        injectorContractInjectorJoin.get("id")
    ));
  }


  private List<InjectorContractOutput> execInjectorContract(TypedQuery<Tuple> query) {
    return query.getResultList()
        .stream()
        .map(tuple -> new InjectorContractOutput(
            tuple.get("injector_contract_id", String.class),
            tuple.get("injector_contract_labels", Map.class),
            tuple.get("injector_contract_content", String.class),
            tuple.get("injector_contract_platforms", Endpoint.PLATFORM_TYPE[].class),
            tuple.get("payload_type", String.class),
            tuple.get("collector_type", String.class),
            tuple.get("injector_contract_injector_type", String.class),
            tuple.get("injector_contract_attack_patterns", String[].class)
        ))
        .toList();
  }

}
