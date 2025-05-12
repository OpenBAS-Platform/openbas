package io.openbas.service.targets.search;

import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.service.InjectExpectationService;
import io.openbas.service.targets.search.specifications.ExcludeMembersOfAssetGroups;
import io.openbas.service.targets.search.specifications.IncludeDirectEndpointTargets;
import io.openbas.service.targets.search.specifications.IncludeMembersOfAssetGroups;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
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
  private final InjectExpectationService injectExpectationService;
  private final IncludeMembersOfAssetGroups includeMembersOfAssetGroups;
  private final ExcludeMembersOfAssetGroups excludeMembersOfAssetGroups;
  private final IncludeDirectEndpointTargets includeDirectEndpointTargets;

  private record AssetGroupSplit(
      List<AssetGroup> includedAssetGroups,
      List<AssetGroup> excludedAssetGroups,
      Filters.FilterOperator filterOperator) {}

  public EndpointTargetSearchAdaptor(
      EndpointRepository endpointRepository,
      InjectExpectationService injectExpectationService,
      IncludeMembersOfAssetGroups includeMembersOfAssetGroups,
      ExcludeMembersOfAssetGroups excludeMembersOfAssetGroups,
      IncludeDirectEndpointTargets includeDirectEndpointTargets) {
    this.endpointRepository = endpointRepository;
    this.injectExpectationService = injectExpectationService;
    this.includeMembersOfAssetGroups = includeMembersOfAssetGroups;
    this.excludeMembersOfAssetGroups = excludeMembersOfAssetGroups;
    this.includeDirectEndpointTargets = includeDirectEndpointTargets;
    // field name translations
    this.fieldTranslations.put("target_name", "asset_name");
    this.fieldTranslations.put("target_tags", "asset_tags");
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, @NotNull Inject scopedInject) {
    AssetGroupSplit split = determineAssetGroupSplit(scopedInject, input);

    Specification<Endpoint> overallSpec =
        switch (split.filterOperator) {
          case null ->
              includeMembersOfAssetGroups
                  .buildSpecification(
                      split.includedAssetGroups.stream().map(AssetGroup::getId).toList())
                  .or(includeDirectEndpointTargets.buildSpecification(scopedInject));

          case contains, not_empty ->
              includeMembersOfAssetGroups.buildSpecification(
                  split.includedAssetGroups.stream().map(AssetGroup::getId).toList());

          case empty ->
              excludeMembersOfAssetGroups
                  .buildSpecification(
                      split.excludedAssetGroups.stream().map(AssetGroup::getId).toList())
                  .and(includeDirectEndpointTargets.buildSpecification(scopedInject));
          case not_contains ->
              includeMembersOfAssetGroups
                  .buildSpecification(
                      split.includedAssetGroups.stream().map(AssetGroup::getId).toList())
                  .and(
                      excludeMembersOfAssetGroups.buildSpecification(
                          split.excludedAssetGroups.stream().map(AssetGroup::getId).toList()))
                  .or(includeDirectEndpointTargets.buildSpecification(scopedInject));
          default -> throw new IllegalArgumentException();
        };

    SearchPaginationInput translatedInput = this.translate(input, scopedInject);

    Page<Endpoint> eps =
        buildPaginationJPA(
            (Specification<Endpoint> specification, Pageable pageable) -> {
              if (Filters.FilterMode.and.equals(input.getFilterGroup().getMode())) {
                return this.endpointRepository.findAll(overallSpec.and(specification), pageable);
              }
              return this.endpointRepository.findAll(overallSpec.or(specification), pageable);
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
  public List<FilterUtilsJpa.Option> getOptionsForInject(Inject scopedInject, String textSearch) {
    throw new NotImplementedException("Implement when needed by the Agents paginated tab");
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsByIds(List<String> ids) {
    throw new NotImplementedException("Implement when needed by the Agents paginated tab");
  }

  private AssetGroupSplit determineAssetGroupSplit(
      Inject scopedInject, SearchPaginationInput input) {
    List<AssetGroup> allTargetAssetGroups = scopedInject.getAssetGroups();

    Filters.Filter assetGroupFilter = getAssetGroupFilter(input);
    if (assetGroupFilter == null) {
      return new AssetGroupSplit(allTargetAssetGroups, List.of(), null);
    }

    return switch (assetGroupFilter.getOperator()) {
      case contains ->
          new AssetGroupSplit(
              allTargetAssetGroups.stream()
                  .filter(ag -> assetGroupFilter.getValues().contains(ag.getId()))
                  .toList(),
              List.of(),
              assetGroupFilter.getOperator());
      case not_empty ->
          new AssetGroupSplit(allTargetAssetGroups, List.of(), assetGroupFilter.getOperator());
      case empty ->
          new AssetGroupSplit(List.of(), allTargetAssetGroups, assetGroupFilter.getOperator());
      case not_contains ->
          new AssetGroupSplit(
              allTargetAssetGroups.stream()
                  .filter(ag -> !assetGroupFilter.getValues().contains(ag.getId()))
                  .toList(),
              allTargetAssetGroups.stream()
                  .filter(ag -> assetGroupFilter.getValues().contains(ag.getId()))
                  .toList(),
              assetGroupFilter.getOperator());
      default ->
          throw new IllegalArgumentException("Unknown operator: " + assetGroupFilter.getOperator());
    };
  }

  private Filters.Filter getAssetGroupFilter(SearchPaginationInput input) {
    Filters.FilterGroup filterGroup = input.getFilterGroup();
    String key = "target_asset_groups";

    return filterGroup.getFilters().stream()
        .filter(filter -> key.equals(filter.getKey()))
        .findFirst()
        .orElse(null);
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
            injectExpectationService.findMergedExpectationsByInjectAndTargetAndTargetType(
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
