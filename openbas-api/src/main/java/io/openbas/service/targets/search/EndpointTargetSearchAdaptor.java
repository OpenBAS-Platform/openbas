package io.openbas.service.targets.search;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.openbas.database.model.*;
import io.openbas.database.repository.AssetGroupRepository;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
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
    this.fieldTranslations.put("target_asset_groups", "endpoint_asset_groups");
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, @NotNull Inject scopedInject) {
    // dynamic filters from target dynamic groups
    Specification<Endpoint> dynamicFilterSpec =
        compileFilterGroupsWithOR(
            assetGroupRepository.rawDynamicFiltersByInjectId(scopedInject.getId()).stream()
                .map(
                    df -> {
                      try {
                        return new ObjectMapper().readValue(df, Filters.FilterGroup.class);
                      } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                      }
                    })
                .toList());

    // transitive targeting via explicit membership in target asset groups
    Specification<Endpoint> transitiveTargetingSpec =
        (root, query, criteriaBuilder) -> {
          Subquery<Integer> subQuery = query.subquery(Integer.class);
          Root<Inject> injectTable = subQuery.from(Inject.class);
          Join<Inject, AssetGroup> assetGroupJoin = injectTable.join("assetGroups");
          Join<AssetGroup, Asset> assetJoin = assetGroupJoin.join("assets");

          subQuery
              .select(criteriaBuilder.literal(1))
              .where(
                  criteriaBuilder.equal(injectTable.get("id"), scopedInject.getId()),
                  criteriaBuilder.equal(
                      assetJoin.get("id"), query.getRoots().stream().findFirst().get().get("id")));
          return criteriaBuilder.exists(subQuery);
        };

    // direct targeting
    Specification<Endpoint> directTargetingSpec =
        (root, query, criteriaBuilder) -> {
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

    Specification<Endpoint> compiledTargetingSpec = transitiveTargetingSpec.or(directTargetingSpec);

    Page<Endpoint> eps =
        buildPaginationJPA(
            (Specification<Endpoint> specification, Pageable pageable) -> {
              Specification<Endpoint> finalSpec =
                  dynamicFilterSpec == null
                      ? compiledTargetingSpec.and(specification)
                      : dynamicFilterSpec.or(compiledTargetingSpec).and(specification);
              return this.endpointRepository.findAll(finalSpec, pageable);
            },
            this.translate(input, scopedInject),
            Endpoint.class);

    return new PageImpl<>(
        eps.getContent().stream()
            .map(endpoint -> convertFromEndpoint(endpoint, scopedInject))
            .toList(),
        eps.getPageable(),
        eps.getTotalElements());
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
            endpoint.getPlatform().name(),
            new HashSet<>());

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
