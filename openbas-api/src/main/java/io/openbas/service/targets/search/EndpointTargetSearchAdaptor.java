package io.openbas.service.targets.search;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.AssetGroupRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.NotImplementedException;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class EndpointTargetSearchAdaptor extends SearchAdaptorBase {
  private final EndpointRepository endpointRepository;
  private final AssetGroupRepository assetGroupRepository;
  private final InjectExpectationService injectExpectationService;

  public EndpointTargetSearchAdaptor(
      EndpointRepository endpointRepository,
      AssetGroupRepository assetGroupRepository,
      InjectExpectationService injectExpectationService) {
    this.endpointRepository = endpointRepository;
    this.assetGroupRepository = assetGroupRepository;
    this.injectExpectationService = injectExpectationService;
    // field name translations
    this.fieldTranslations.put("target_name", "asset_name");
    this.fieldTranslations.put("target_tags", "asset_tags");
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, @NotNull Inject scopedInject) {
    Filters.Filter assetGroupFilter = getAssetGroupFilter(input);
    List<String> assetGroupValues =
        assetGroupFilter == null ? List.of() : assetGroupFilter.getValues();

    Specification<Endpoint> finalSpecification = null;
    if (assetGroupFilter == null) {
      Specification<Endpoint> dynamicFilterSpec =
          getDynamicFilterSpecification(scopedInject, assetGroupValues, true);
      // transitive targeting via explicit membership in target asset groups
      Specification<Endpoint> transitiveTargetingSpec =
          getTransitiveTargetingSpecification(scopedInject, assetGroupValues, true);
      // direct targeting
      Specification<Endpoint> directTargetingSpec = getDirectTargetingSpecification(scopedInject);
      finalSpecification =
          dynamicFilterSpec == null
              ? transitiveTargetingSpec.or(directTargetingSpec)
              : dynamicFilterSpec.or(transitiveTargetingSpec).or(directTargetingSpec);
    } else {

      switch (assetGroupFilter.getOperator()) {
        case contains, not_empty -> {
          Specification<Endpoint> dynamicFilterSpec =
              getDynamicFilterSpecification(scopedInject, assetGroupValues, true);
          // transitive targeting via explicit membership in target asset groups
          Specification<Endpoint> transitiveTargetingSpec =
              getTransitiveTargetingSpecification(scopedInject, assetGroupValues, true);
          finalSpecification =
              dynamicFilterSpec == null
                  ? transitiveTargetingSpec
                  : dynamicFilterSpec.or(transitiveTargetingSpec);
        }
        case not_contains -> {
          Specification<Endpoint> dynamicFilterSpec =
              ((root, query, criteriaBuilder) -> {
                Specification<Endpoint> positiveFilters =
                    getDynamicFilterSpecification(scopedInject, assetGroupValues, false);
                if (positiveFilters == null) {
                  return null;
                }
                Subquery<Integer> subQuery = query.subquery(Integer.class);
                subQuery.from(Asset.class);

                subQuery
                    .select(criteriaBuilder.literal(1))
                    .where(positiveFilters.toPredicate(root, query, criteriaBuilder));
                return criteriaBuilder.exists(subQuery).not();
              });
          // transitive targeting via explicit membership in target asset groups
          Specification<Endpoint> transitiveTargetingSpec =
              getTransitiveTargetingSpecification(scopedInject, assetGroupValues, false);
          // direct targeting
          Specification<Endpoint> directTargetingSpec =
              getDirectTargetingSpecification(scopedInject);
          finalSpecification =
              dynamicFilterSpec == null
                  ? transitiveTargetingSpec.and(directTargetingSpec)
                  : dynamicFilterSpec.and(transitiveTargetingSpec).and(directTargetingSpec);
        }
        case empty -> finalSpecification = getDirectTargetingSpecification(scopedInject);
      }
    }

    SearchPaginationInput translatedInput = this.translate(input, scopedInject);

    Specification<Endpoint> finalSpecification1 = finalSpecification;
    Page<Endpoint> eps =
        buildPaginationJPA(
            (Specification<Endpoint> specification, Pageable pageable) -> {
              if (Filters.FilterMode.and.equals(input.getFilterGroup().getMode())) {
                return this.endpointRepository.findAll(
                    finalSpecification1.and(specification), pageable);
              }
              return this.endpointRepository.findAll(
                  finalSpecification1.or(specification), pageable);
            },
            translatedInput,
            Endpoint.class);

    return new PageImpl<>(
        eps.getContent().stream()
            .map(endpoint -> convertFromEndpoint(endpoint, scopedInject))
            .toList(),
        eps.getPageable(),
        eps.getTotalElements());
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsForInject(Inject scopedInject) {
    throw new NotImplementedException("Implement when needed by the Agents paginated tab");
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsByIds(List<String> ids) {
    throw new NotImplementedException("Implement when needed by the Agents paginated tab");
  }

  private Filters.Filter getAssetGroupFilter(SearchPaginationInput input) {
    Filters.FilterGroup filterGroup = input.getFilterGroup();
    String key = "target_asset_groups";

    return filterGroup.getFilters().stream()
        .filter(filter -> key.equals(filter.getKey()))
        .findFirst()
        .orElse(null);
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

  private Specification<Endpoint> getTransitiveTargetingSpecification(
      Inject scopedInject, List<String> scopedAssetGroupIds, boolean in) {
    return (root, query, criteriaBuilder) -> {
      Subquery<Integer> subQuery = query.subquery(Integer.class);
      Root<Inject> injectTable = subQuery.from(Inject.class);
      Join<Inject, AssetGroup> assetGroupJoin = injectTable.join("assetGroups");
      Join<AssetGroup, Asset> assetJoin = assetGroupJoin.join("assets");

      List<Predicate> predicates =
          new ArrayList<>(
              List.of(
                  criteriaBuilder.equal(injectTable.get("id"), scopedInject.getId()),
                  criteriaBuilder.equal(
                      assetJoin.get("id"), query.getRoots().stream().findFirst().get().get("id"))));
      if (scopedAssetGroupIds != null && !scopedAssetGroupIds.isEmpty()) {
        predicates.add(assetGroupJoin.get("id").in(scopedAssetGroupIds.stream().toList()));
      }

      subQuery.select(criteriaBuilder.literal(1)).where(predicates.toArray(new Predicate[0]));
      return in ? criteriaBuilder.exists(subQuery) : criteriaBuilder.exists(subQuery).not();
    };
  }

  private Specification<Endpoint> getDynamicFilterSpecification(
      Inject scopedInject, List<String> scopedAssetGroupIds, boolean in) {
    return compileFilterGroupsWithOR(
        (!scopedAssetGroupIds.isEmpty()
                ? assetGroupRepository.rawDynamicFiltersByInjectIdAndAssetGroupIds(
                    scopedInject.getId(), scopedAssetGroupIds)
                : assetGroupRepository.rawDynamicFiltersByInjectId(scopedInject.getId()))
            .stream()
                .map(df -> df.getAssetGroupDynamicFilter())
                .filter(fg -> !fg.getFilters().isEmpty())
                .toList());
  }

  private Specification<Endpoint> compileFilterGroupsWithOR(
      @NotNull List<Filters.FilterGroup> filterGroups) {
    Specification<Endpoint> result = null;
    for (Filters.FilterGroup filterGroup : filterGroups) {
      Specification<Endpoint> converted = FilterUtilsJpa.computeFilterGroupJpa(filterGroup);
      if (result == null) {
        result = converted;
        continue;
      }
      result = result.or(converted);
    }
    return result;
  }

  private InjectTarget convertFromEndpoint(Endpoint endpoint, Inject inject) {
    InjectTarget target =
        new EndpointTarget(
            endpoint.getId(),
            endpoint.getName(),
            endpoint.getTags().stream().map(Tag::getId).collect(Collectors.toSet()),
            endpoint.getPlatform().name());

    List<AtomicTestingUtils.ExpectationResultsByType> results =
        AtomicTestingUtils.getExpectationResultByTypes(
            injectExpectationService.findExpectationsByInjectAndTargetAndTargetTypeUnderAllParents(
                inject.getId(), target.getId(), target.getTargetType()));

    for (AtomicTestingUtils.ExpectationResultsByType result : results) {
      switch (result.type()) {
        case DETECTION -> target.setTargetDetectionStatus(result.avgResult());
        case PREVENTION -> target.setTargetPreventionStatus(result.avgResult());
        case HUMAN_RESPONSE -> target.setTargetHumanResponseStatus(result.avgResult());
      }
    }

    return target;
  }
}
