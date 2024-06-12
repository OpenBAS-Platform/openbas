package io.openbas.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.repository.InjectDocumentRepository;
import io.openbas.database.repository.InjectRepository;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.rest.inject.output.InjectOutput;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static io.openbas.utils.JpaUtils.arrayAgg;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class InjectService {

  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;

  @PersistenceContext
  private EntityManager entityManager;

  public void cleanInjectsDocExercise(String exerciseId, String documentId) {
    // Delete document from all exercise injects
    List<Inject> exerciseInjects = injectRepository.findAllForExerciseAndDoc(exerciseId, documentId);
    List<InjectDocument> updatedInjects = exerciseInjects.stream().flatMap(inject -> {
      @SuppressWarnings("UnnecessaryLocalVariable")
      Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
          .filter(document -> document.getDocument().getId().equals(documentId));
      return filterDocuments;
    }).toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  public void cleanInjectsDocScenario(String scenarioId, String documentId) {
    // Delete document from all scenario injects
    List<Inject> scenarioInjects = injectRepository.findAllForScenarioAndDoc(scenarioId, documentId);
    List<InjectDocument> updatedInjects = scenarioInjects.stream().flatMap(inject -> {
      @SuppressWarnings("UnnecessaryLocalVariable")
      Stream<InjectDocument> filterDocuments = inject.getDocuments().stream()
          .filter(document -> document.getDocument().getId().equals(documentId));
      return filterDocuments;
    }).toList();
    injectDocumentRepository.deleteAll(updatedInjects);
  }

  @Transactional(rollbackOn = Exception.class)
  public Inject updateInjectStatus(String injectId, InjectUpdateStatusInput input) {
    Inject inject = injectRepository.findById(injectId).orElseThrow();
    // build status
    InjectStatus injectStatus = new InjectStatus();
    injectStatus.setInject(inject);
    injectStatus.setTrackingSentDate(now());
    injectStatus.setName(ExecutionStatus.valueOf(input.getStatus()));
    injectStatus.setTrackingTotalExecutionTime(0L);
    // Save status for inject
    inject.setStatus(injectStatus);
    return injectRepository.save(inject);
  }

  public List<InjectOutput> injects(Specification<Inject> specification) {
    CriteriaBuilder cb = this.entityManager.getCriteriaBuilder();

    // -- Create Query --
    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<Inject> injectRoot = cq.from(Inject.class);

    // Joins
    Join<Inject, Exercise> injectExerciseJoin = createLeftJoin(injectRoot, "exercise");
    Join<Inject, Scenario> injectScenarioJoin = createLeftJoin(injectRoot, "scenario");
    Join<Inject, InjectorContract> injectorContractJoin = createLeftJoin(injectRoot, "injectorContract");
    Join<InjectorContract, Injector> injectorJoin = injectorContractJoin.join("injector", JoinType.LEFT);
    Expression<String[]> tagIdsExpression = createArrayAgg(cb, injectRoot, "tags");
    Expression<String[]> teamIdsExpression = createArrayAgg(cb, injectRoot, "teams");
    Expression<String[]> assetIdsExpression = createArrayAgg(cb, injectRoot, "assets");
    Expression<String[]> assetGroupIdsExpression = createArrayAgg(cb, injectRoot, "assetGroups");

    // SELECT
    cq.multiselect(
        injectRoot.get("id").alias("inject_id"),
        injectRoot.get("title").alias("inject_title"),
        injectRoot.get("enabled").alias("inject_enabled"),
        injectRoot.get("content").alias("inject_content"),
        injectRoot.get("allTeams").alias("inject_all_teams"),
        injectExerciseJoin.get("id").alias("inject_exercise"),
        injectScenarioJoin.get("id").alias("inject_scenario"),
        injectRoot.get("dependsDuration").alias("inject_depends_duration"),
        injectorContractJoin.alias("inject_injector_contract"),
        tagIdsExpression.alias("inject_tags"),
        teamIdsExpression.alias("inject_teams"),
        assetIdsExpression.alias("inject_assets"),
        assetGroupIdsExpression.alias("inject_asset_groups"),
        injectorJoin.get("type").alias("inject_type")
    ).distinct(true);

    // Group By
    cq.groupBy(Arrays.asList(
        injectRoot.get("id"),
        injectorContractJoin.get("id"),
        injectorJoin.get("id"),
        injectExerciseJoin.get("id"),
        injectScenarioJoin.get("id")
    ));

    // Sort
    cq.orderBy(cb.asc(injectRoot.get("dependsDuration")));

    // -- Specification --
    if (specification != null) {
      Predicate predicate = specification.toPredicate(injectRoot, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    // Type Query
    TypedQuery<Tuple> query = this.entityManager.createQuery(cq);

    // -- EXECUTION --
    return query.getResultList()
        .stream()
        .map(tuple -> new InjectOutput(
            tuple.get("inject_id", String.class),
            tuple.get("inject_title", String.class),
            tuple.get("inject_enabled", Boolean.class),
            tuple.get("inject_content", ObjectNode.class),
            tuple.get("inject_all_teams", Boolean.class),
            tuple.get("inject_exercise", String.class),
            tuple.get("inject_scenario", String.class),
            tuple.get("inject_depends_duration", Long.class),
            tuple.get("inject_injector_contract", InjectorContract.class),
            tuple.get("inject_tags", String[].class),
            tuple.get("inject_teams", String[].class),
            tuple.get("inject_assets", String[].class),
            tuple.get("inject_asset_groups", String[].class),
            tuple.get("inject_type", String.class)
        ))
        .toList();
  }

  private <X, Y> Join<X, Y> createLeftJoin(Root<X> root, String attributeName) {
    return root.join(attributeName, JoinType.LEFT);
  }

  private <X, Y> Expression<String[]> createArrayAgg(CriteriaBuilder cb, Root<X> root, String attributeName) {
    Join<X, Y> join = root.join(attributeName, JoinType.LEFT);
    return arrayAgg(cb, join);
  }

}
