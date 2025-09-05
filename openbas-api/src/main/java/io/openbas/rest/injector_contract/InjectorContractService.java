package io.openbas.rest.injector_contract;

import static io.openbas.database.criteria.GenericCriteria.countQuery;
import static io.openbas.helper.DatabaseHelper.updateRelation;
import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.JpaUtils.createLeftJoin;
import static io.openbas.utils.pagination.SortUtilsCriteriaBuilder.toSortCriteriaBuilder;

import io.openbas.database.model.*;
import io.openbas.database.raw.RawInjectorsContrats;
import io.openbas.database.repository.InjectorContractRepository;
import io.openbas.database.repository.InjectorRepository;
import io.openbas.injectors.email.EmailContract;
import io.openbas.injectors.ovh.OvhSmsContract;
import io.openbas.rest.attack_pattern.service.AttackPatternService;
import io.openbas.rest.cve.service.CveService;
import io.openbas.rest.exception.ElementNotFoundException;
import io.openbas.rest.injector_contract.form.InjectorContractAddInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateInput;
import io.openbas.rest.injector_contract.form.InjectorContractUpdateMappingInput;
import io.openbas.rest.injector_contract.output.InjectorContractBaseOutput;
import io.openbas.rest.injector_contract.output.InjectorContractFullOutput;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class InjectorContractService {

  @PersistenceContext private EntityManager entityManager;

  private final InjectorContractRepository injectorContractRepository;
  private final AttackPatternService attackPatternService;
  private final CveService cveService;
  private final InjectorRepository injectorRepository;

  @Value("${openbas.xls.import.mail.enable}")
  private boolean mailImportEnabled;

  @Value("${openbas.xls.import.sms.enable}")
  private boolean smsImportEnabled;

  // -- CRUD --

  public InjectorContract injectorContract(@NotBlank final String id) {
    return injectorContractRepository
        .findByIdOrExternalId(id, id)
        .orElseThrow(() -> new ElementNotFoundException("Injector contract not found"));
  }

  // -- OTHERS --

  @EventListener(ApplicationReadyEvent.class)
  public void initImportAvailableOnStartup() {
    List<String> listOfInjectorImportAvailable = new ArrayList<>();
    if (mailImportEnabled) {
      listOfInjectorImportAvailable.addAll(
          Arrays.asList(EmailContract.EMAIL_GLOBAL, EmailContract.EMAIL_DEFAULT));
    }
    if (smsImportEnabled) {
      listOfInjectorImportAvailable.add(OvhSmsContract.OVH_DEFAULT);
    }

    List<InjectorContract> listInjectorContract = new ArrayList<>();
    injectorContractRepository.findAll().spliterator().forEachRemaining(listInjectorContract::add);
    listInjectorContract.forEach(
        injectorContract -> {
          injectorContract.setImportAvailable(
              listOfInjectorImportAvailable.contains(injectorContract.getId()));
        });
    injectorContractRepository.saveAll(listInjectorContract);
  }

  @Setter
  @Getter
  private class QuerySetup {
    private TypedQuery<Tuple> query;
    private Long total;
  }

  private QuerySetup setupQuery(
      @Nullable final Specification<InjectorContract> specification,
      @Nullable final Specification<InjectorContract> specificationCount,
      @NotNull final Pageable pageable,
      boolean include_full_details) {
    CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<InjectorContract> injectorContractRoot = cq.from(InjectorContract.class);
    if (include_full_details) {
      selectForInjectorContractFull(cb, cq, injectorContractRoot);
    } else {
      selectForInjectorContractBase(cb, cq, injectorContractRoot);
    }

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

    // -- Count Query --
    Long total = countQuery(cb, this.entityManager, InjectorContract.class, specificationCount);

    QuerySetup qs = new QuerySetup();
    qs.setQuery(query);
    qs.setTotal(total);
    return qs;
  }

  public PageImpl<InjectorContractFullOutput> getSinglePageFullDetails(
      @Nullable final Specification<InjectorContract> specification,
      @Nullable final Specification<InjectorContract> specificationCount,
      @NotNull final Pageable pageable) {
    QuerySetup qs = setupQuery(specification, specificationCount, pageable, true);

    // -- EXECUTION --
    List<InjectorContractFullOutput> injectorContractFullOutputs =
        execInjectorFullContract(qs.query);

    return new PageImpl<>(injectorContractFullOutputs, pageable, qs.total);
  }

  public PageImpl<InjectorContractBaseOutput> getSinglePageBaseDetails(
      @Nullable final Specification<InjectorContract> specification,
      @Nullable final Specification<InjectorContract> specificationCount,
      @NotNull final Pageable pageable) {
    QuerySetup qs = setupQuery(specification, specificationCount, pageable, false);

    // -- EXECUTION --
    List<InjectorContractBaseOutput> injectorContractBaseOutputs =
        execInjectorBaseContract(qs.query);

    return new PageImpl<>(injectorContractBaseOutputs, pageable, qs.total);
  }

  public Iterable<RawInjectorsContrats> getAllRawInjectContracts() {
    return injectorContractRepository.getAllRawInjectorsContracts();
  }

  public InjectorContract getSingleInjectorContract(String injectorContractId) {
    return injectorContractRepository
        .findByIdOrExternalId(injectorContractId, injectorContractId)
        .orElseThrow(ElementNotFoundException::new);
  }

  @Transactional(rollbackOn = Exception.class)
  public InjectorContract createNewInjectorContract(InjectorContractAddInput input) {
    InjectorContract injectorContract = new InjectorContract();
    injectorContract.setCustom(true);
    injectorContract.setUpdateAttributes(input);
    List<AttackPattern> aps = new ArrayList<>();
    if (!input.getAttackPatternsExternalIds().isEmpty()) {
      aps =
          attackPatternService.getAttackPatternsByExternalIdsThrowIfMissing(
              new HashSet<>(input.getAttackPatternsExternalIds()));
    } else if (!input.getAttackPatternsIds().isEmpty()) {
      aps =
          attackPatternService.getAttackPatternsByInternalIdsThrowIfMissing(
              new HashSet<>(input.getAttackPatternsIds()));
    }
    injectorContract.setAttackPatterns(aps);

    List<Cve> vulns = new ArrayList<>();
    if (!input.getVulnerabilityIds().isEmpty()) {
      vulns = cveService.findAllByIdsOrThrowIfMissing(new HashSet<>(input.getVulnerabilityIds()));
    }
    injectorContract.setVulnerabilities(vulns);

    injectorContract.setInjector(
        updateRelation(input.getInjectorId(), injectorContract.getInjector(), injectorRepository));
    return injectorContractRepository.save(injectorContract);
  }

  public InjectorContract updateInjectorContract(
      String injectorContractId, InjectorContractUpdateInput input) {
    InjectorContract injectorContract =
        injectorContractRepository
            .findByIdOrExternalId(injectorContractId, injectorContractId)
            .orElseThrow(ElementNotFoundException::new);
    injectorContract.setUpdateAttributes(input);
    injectorContract.setAttackPatterns(
        attackPatternService.getAttackPatternsByInternalIdsThrowIfMissing(
            new HashSet<>(input.getAttackPatternsIds())));
    injectorContract.setVulnerabilities(
        cveService.findAllByIdsOrThrowIfMissing(new HashSet<>(input.getVulnerabilityIds())));
    injectorContract.setUpdatedAt(Instant.now());
    return injectorContractRepository.save(injectorContract);
  }

  public InjectorContract updateAttackPatternMappings(
      String injectorContractId, InjectorContractUpdateMappingInput input) {
    InjectorContract injectorContract =
        injectorContractRepository
            .findByIdOrExternalId(injectorContractId, injectorContractId)
            .orElseThrow(ElementNotFoundException::new);
    injectorContract.setAttackPatterns(
        attackPatternService.getAttackPatternsByInternalIdsThrowIfMissing(
            new HashSet<>(input.getAttackPatternsIds())));
    injectorContract.setVulnerabilities(
        cveService.findAllByIdsOrThrowIfMissing(new HashSet<>(input.getVulnerabilityIds())));
    injectorContract.setUpdatedAt(Instant.now());
    return injectorContractRepository.save(injectorContract);
  }

  public void deleteInjectorContract(final String injectorContractId) {
    InjectorContract injectorContract =
        this.injectorContractRepository
            .findByIdOrExternalId(injectorContractId, injectorContractId)
            .orElseThrow(
                () ->
                    new ElementNotFoundException(
                        "Injector contract not found: " + injectorContractId));
    if (!injectorContract.getCustom()) {
      throw new IllegalArgumentException(
          "This injector contract can't be removed because is not a custom one: "
              + injectorContractId);
    } else {
      this.injectorContractRepository.deleteById(injectorContract.getId());
    }
  }

  // -- CRITERIA BUILDER --

  private void selectForInjectorContractFull(
      @NotNull final CriteriaBuilder cb,
      @NotNull final CriteriaQuery<Tuple> cq,
      @NotNull final Root<InjectorContract> injectorContractRoot) {
    // Joins
    Join<InjectorContract, Payload> injectorContractPayloadJoin =
        createLeftJoin(injectorContractRoot, "payload");
    Join<Payload, Collector> payloadCollectorJoin =
        injectorContractPayloadJoin.join("collector", JoinType.LEFT);
    Join<InjectorContract, Injector> injectorContractInjectorJoin =
        createLeftJoin(injectorContractRoot, "injector");
    // Array aggregations
    Expression<String[]> attackPatternIdsExpression =
        createJoinArrayAggOnId(cb, injectorContractRoot, "attackPatterns");

    // SELECT
    cq.multiselect(
            injectorContractRoot.get("id").alias("injector_contract_id"),
            injectorContractRoot.get("externalId").alias("injector_contract_external_id"),
            injectorContractRoot.get("labels").alias("injector_contract_labels"),
            injectorContractRoot.get("content").alias("injector_contract_content"),
            injectorContractRoot.get("platforms").alias("injector_contract_platforms"),
            injectorContractPayloadJoin.get("type").alias("payload_type"),
            payloadCollectorJoin.get("type").alias("collector_type"),
            injectorContractInjectorJoin.get("type").alias("injector_contract_injector_type"),
            injectorContractInjectorJoin.get("name").alias("injector_contract_injector_name"),
            attackPatternIdsExpression.alias("injector_contract_attack_patterns"),
            injectorContractRoot.get("updatedAt").alias("injector_contract_updated_at"),
            injectorContractPayloadJoin.get("executionArch").alias("payload_execution_arch"))
        .distinct(true);

    // GROUP BY
    cq.groupBy(
        Arrays.asList(
            injectorContractRoot.get("id"),
            injectorContractPayloadJoin.get("id"),
            payloadCollectorJoin.get("id"),
            injectorContractInjectorJoin.get("id")));
  }

  private List<InjectorContractFullOutput> execInjectorFullContract(TypedQuery<Tuple> query) {
    return query.getResultList().stream()
        .map(
            tuple ->
                new InjectorContractFullOutput(
                    tuple.get("injector_contract_id", String.class),
                    tuple.get("injector_contract_external_id", String.class),
                    tuple.get("injector_contract_labels", Map.class),
                    tuple.get("injector_contract_content", String.class),
                    tuple.get("injector_contract_platforms", Endpoint.PLATFORM_TYPE[].class),
                    tuple.get("payload_type", String.class),
                    tuple.get("injector_contract_injector_name", String.class),
                    tuple.get("collector_type", String.class),
                    tuple.get("injector_contract_injector_type", String.class),
                    tuple.get("injector_contract_attack_patterns", String[].class),
                    tuple.get("injector_contract_updated_at", Instant.class),
                    tuple.get("payload_execution_arch", Payload.PAYLOAD_EXECUTION_ARCH.class)))
        .toList();
  }

  private void selectForInjectorContractBase(
      @NotNull final CriteriaBuilder cb,
      @NotNull final CriteriaQuery<Tuple> cq,
      @NotNull final Root<InjectorContract> injectorContractRoot) {
    // SELECT
    cq.multiselect(
            injectorContractRoot.get("id").alias("injector_contract_id"),
            injectorContractRoot.get("externalId").alias("injector_contract_external_id"),
            injectorContractRoot.get("updatedAt").alias("injector_contract_updated_at"))
        .distinct(true);
  }

  private List<InjectorContractBaseOutput> execInjectorBaseContract(TypedQuery<Tuple> query) {
    return query.getResultList().stream()
        .map(
            tuple ->
                new InjectorContractBaseOutput(
                    tuple.get("injector_contract_id", String.class),
                    tuple.get("injector_contract_external_id", String.class),
                    tuple.get("injector_contract_updated_at", Instant.class)))
        .toList();
  }
}
