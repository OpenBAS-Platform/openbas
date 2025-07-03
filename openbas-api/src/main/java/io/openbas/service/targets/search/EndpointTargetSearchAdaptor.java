package io.openbas.service.targets.search;

import static io.openbas.helper.StreamHelper.fromIterable;
import static io.openbas.utils.pagination.PaginationUtils.buildPaginationJPA;

import io.openbas.database.model.*;
import io.openbas.database.repository.EndpointRepository;
import io.openbas.service.InjectExpectationService;
import io.openbas.service.targets.search.specifications.IncludeDirectEndpointTargetsSpecification;
import io.openbas.service.targets.search.specifications.IncludeMembersOfAssetGroupsSpecification;
import io.openbas.service.targets.search.specifications.SearchSpecificationUtils;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.FilterUtilsJpa;
import io.openbas.utils.pagination.SearchPaginationInput;
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
  private final InjectExpectationService injectExpectationService;
  private final SearchSpecificationUtils<Endpoint> searchSpecificationUtils;
  private final IncludeMembersOfAssetGroupsSpecification<Endpoint>
      includeMembersOfAssetGroupsSpecification;
  private final IncludeDirectEndpointTargetsSpecification<Endpoint>
      includeDirectEndpointTargetsSpecification;

  private final List<String> joinPath = List.of("assets");

  public EndpointTargetSearchAdaptor(
      EndpointRepository endpointRepository,
      InjectExpectationService injectExpectationService,
      SearchSpecificationUtils<Endpoint> searchSpecificationUtils,
      IncludeMembersOfAssetGroupsSpecification<Endpoint> includeMembersOfAssetGroupsSpecification,
      IncludeDirectEndpointTargetsSpecification<Endpoint>
          includeDirectEndpointTargetsSpecification) {
    this.endpointRepository = endpointRepository;
    this.injectExpectationService = injectExpectationService;
    this.searchSpecificationUtils = searchSpecificationUtils;
    this.includeMembersOfAssetGroupsSpecification = includeMembersOfAssetGroupsSpecification;
    this.includeDirectEndpointTargetsSpecification = includeDirectEndpointTargetsSpecification;
    // field name translations
    this.fieldTranslations.put("target_name", "asset_name");
    this.fieldTranslations.put("target_tags", "asset_tags");
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, @NotNull Inject scopedInject) {
    Specification<Endpoint> overallSpec =
        searchSpecificationUtils.compileSpecificationForAssetGroupMembership(
            scopedInject, input, joinPath);

    Specification<Endpoint> memberOfAnyTargetGroupSpec =
        searchSpecificationUtils.compileSpecificationForAssetGroupMembership(
            scopedInject,
            SearchPaginationInput.builder().filterGroup(new Filters.FilterGroup()).build(),
            joinPath);

    SearchPaginationInput translatedInput = this.translate(input, scopedInject);

    Page<Endpoint> eps =
        buildPaginationJPA(
            (Specification<Endpoint> specification, Pageable pageable) -> {
              if (Filters.FilterMode.and.equals(input.getFilterGroup().getMode())) {
                return this.endpointRepository.findAll(overallSpec.and(specification), pageable);
              }
              return this.endpointRepository.findAll(
                  overallSpec.or(specification.and(memberOfAnyTargetGroupSpec)), pageable);
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
    Specification<Endpoint> spec =
        includeMembersOfAssetGroupsSpecification
            .buildSpecification(
                scopedInject.getAssetGroups().stream().map(AssetGroup::getId).toList(), joinPath)
            .or(
                includeDirectEndpointTargetsSpecification.buildSpecification(
                    scopedInject, joinPath));

    Specification<Endpoint> nameSpec =
        (root, query, criteriaBuilder) ->
            criteriaBuilder.like(root.get("name"), "%" + textSearch + "%");

    return this.endpointRepository.findAll(spec.and(nameSpec)).stream()
        .map(ep -> new FilterUtilsJpa.Option(ep.getId(), ep.getName()))
        .toList();
  }

  @Override
  public List<FilterUtilsJpa.Option> getOptionsByIds(List<String> ids) {
    return fromIterable(this.endpointRepository.findAllById(ids)).stream()
        .map(ep -> new FilterUtilsJpa.Option(ep.getId(), ep.getName()))
        .toList();
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
        case VULNERABILITY -> target.setTargetVulnerabilityStatus(result.avgResult());
        case HUMAN_RESPONSE -> target.setTargetHumanResponseStatus(result.avgResult());
      }
    }

    return target;
  }
}
