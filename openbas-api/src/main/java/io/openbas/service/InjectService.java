package io.openbas.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import io.openbas.database.model.*;
import io.openbas.database.raw.*;
import io.openbas.database.repository.*;
import io.openbas.rest.inject.form.InjectUpdateStatusInput;
import io.openbas.rest.inject.output.InjectOutput;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static io.openbas.utils.JpaUtils.createJoinArrayAggOnId;
import static io.openbas.utils.JpaUtils.createLeftJoin;
import static java.time.Instant.now;

@RequiredArgsConstructor
@Service
public class InjectService {

  private final InjectRepository injectRepository;
  private final InjectDocumentRepository injectDocumentRepository;
  private final InjectExpectationRepository injectExpectationRepository;
  private final AssetRepository assetRepository;
  private final AssetGroupRepository assetGroupRepository;
  private final TeamRepository teamRepository;

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

    CriteriaQuery<Tuple> cq = cb.createTupleQuery();
    Root<Inject> injectRoot = cq.from(Inject.class);
    selectForInject(cb, cq, injectRoot);

    // -- Text Search and Filters --
    if (specification != null) {
      Predicate predicate = specification.toPredicate(injectRoot, cq, cb);
      if (predicate != null) {
        cq.where(predicate);
      }
    }

    // -- Sorting --
    cq.orderBy(cb.asc(injectRoot.get("dependsDuration")));

    // Type Query
    TypedQuery<Tuple> query = this.entityManager.createQuery(cq);

    // -- EXECUTION --
    return execInject(query);
  }

  // -- CRITERIA BUILDER --

  private void selectForInject(CriteriaBuilder cb, CriteriaQuery<Tuple> cq, Root<Inject> injectRoot) {
    // Joins
    Join<Inject, Exercise> injectExerciseJoin = createLeftJoin(injectRoot, "exercise");
    Join<Inject, Scenario> injectScenarioJoin = createLeftJoin(injectRoot, "scenario");
    Join<Inject, InjectorContract> injectorContractJoin = createLeftJoin(injectRoot, "injectorContract");
    Join<InjectorContract, Injector> injectorJoin = injectorContractJoin.join("injector", JoinType.LEFT);
    // Array aggregations
    Expression<String[]> tagIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "tags");
    Expression<String[]> teamIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "teams");
    Expression<String[]> assetIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "assets");
    Expression<String[]> assetGroupIdsExpression = createJoinArrayAggOnId(cb, injectRoot, "assetGroups");

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

    // GROUP BY
    cq.groupBy(Arrays.asList(
        injectRoot.get("id"),
        injectExerciseJoin.get("id"),
        injectScenarioJoin.get("id"),
        injectorContractJoin.get("id"),
        injectorJoin.get("id")
    ));
  }

  private List<InjectOutput> execInject(TypedQuery<Tuple> query) {
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

  // -- TEST --

  /**
   * Create inject programmatically based on rawInject, rawInjectExpectation, rawAsset, rawAssetGroup, rawTeam
   */
  public Map<String, Inject> mapOfInjects(@NotNull final List<String> injectIds) {
    List<Inject> listOfInjects = new ArrayList<>();

    List<RawInject> listOfRawInjects = this.injectRepository.findRawByIds(injectIds);
    // From the list of injects, we get all the inject expectationsIds that we then get
    // and put into a map with the expections ids as key
    Map<String, RawInjectExpectation> mapOfInjectsExpectations = mapOfInjectsExpectations(listOfRawInjects);

    // We get the asset groups from the injects AND the injects expectations as those can also have asset groups
    // We then make a map out of it for faster access
    Map<String, RawAssetGroup> mapOfAssetGroups = mapOfAssetGroups(listOfRawInjects, mapOfInjectsExpectations.values());

    // We get all the assets that are
    // 1 - linked to an inject
    // 2 - linked to an asset group linked to an inject
    // 3 - linked to an inject expectation
    // 4 - linked to an asset group linked to an inject expectations
    // We then make a map out of it
    Map<String, RawAsset> mapOfAssets = mapOfAssets(listOfRawInjects, mapOfInjectsExpectations, mapOfAssetGroups);

    // We get all the teams that are linked to an inject or an asset group
    // Then we make a map out of it for faster access
    Map<String, RawTeam> mapOfRawTeams = mapOfRawTeams(listOfRawInjects, mapOfInjectsExpectations);

    // Once we have all of this, we create an Inject for each InjectRaw that we have using all the Raw objects we got
    // Then we make a map out of it for faster access
    listOfRawInjects.stream().map((inject) -> Inject.fromRawInject(inject, mapOfRawTeams, mapOfInjectsExpectations, mapOfAssetGroups, mapOfAssets)).forEach(listOfInjects::add);
    return listOfInjects.stream().collect(Collectors.toMap(Inject::getId, Function.identity()));
  }

  private Map<String, RawInjectExpectation> mapOfInjectsExpectations(@NotNull final List<RawInject> rawInjects) {
    return this.injectExpectationRepository
        .rawByIds(
            rawInjects.stream().flatMap(rawInject -> rawInject.getInject_expectations().stream()).toList()
        )
        .stream()
        .collect(Collectors.toMap(RawInjectExpectation::getInject_expectation_id, Function.identity()));
  }

  private Map<String, RawAssetGroup> mapOfAssetGroups(
      @NotNull final List<RawInject> rawInjects,
      @NotNull final Collection<RawInjectExpectation> rawInjectExpectations) {
    return this.assetGroupRepository
        .rawAssetGroupByIds(
            Stream.concat(
                    rawInjectExpectations.stream()
                        .map(RawInjectExpectation::getAsset_group_id)
                        .filter(Objects::nonNull),
                    rawInjects.stream()
                        .map(RawInject::getAsset_group_id)
                        .filter(Objects::nonNull))
                .toList())
        .stream()
        .collect(Collectors.toMap(RawAssetGroup::getAsset_group_id, Function.identity()));
  }

  private Map<String, RawAsset> mapOfAssets(
      @NotNull final List<RawInject> rawInjects,
      @NotNull final Map<String, RawInjectExpectation> mapOfInjectsExpectations,
      @NotNull final Map<String, RawAssetGroup> mapOfAssetGroups) {
    return this.assetRepository
        .rawByIds(rawInjects.stream().flatMap(rawInject -> Stream.concat(Stream.concat(
                rawInject.getInject_asset_groups().stream()
                    .flatMap(assetGroup -> Optional.ofNullable(mapOfAssetGroups.get(assetGroup))
                        .map(ag -> ag.getAsset_ids().stream())
                        .orElse(Stream.empty())),
            rawInject.getInject_assets().stream()
            ), Stream.concat(
                rawInject.getInject_expectations().stream()
                    .map(mapOfInjectsExpectations::get)
                    .map(RawInjectExpectation::getAsset_id),
                rawInject.getInject_expectations().stream()
                    .map(mapOfInjectsExpectations::get)
                    .flatMap(injectExpectation -> injectExpectation.getAsset_group_id() != null ? mapOfAssetGroups.get(injectExpectation.getAsset_group_id()).getAsset_ids().stream() : Stream.empty()))
        )).filter(Objects::nonNull).toList()).stream()
        .collect(Collectors.toMap(RawAsset::getAsset_id, Function.identity()));
  }

  private Map<String, RawTeam> mapOfRawTeams(
      @NotNull final List<RawInject> rawInjects,
      @NotNull final Map<String, RawInjectExpectation> mapOfInjectsExpectations) {
    return this.teamRepository.rawTeamByIds(rawInjects.stream()
        .flatMap(
            rawInject -> Stream.concat(
                rawInject.getInject_teams().stream(),
                rawInject.getInject_expectations().stream().map(expectationId -> mapOfInjectsExpectations.get(expectationId).getTeam_id())
            ).filter(Objects::nonNull)
        ).distinct().toList()).stream().collect(Collectors.toMap(RawTeam::getTeam_id, Function.identity()));
  }


}
