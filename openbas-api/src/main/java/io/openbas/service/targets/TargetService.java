package io.openbas.service.targets;

import io.openbas.database.model.*;
import io.openbas.rest.asset_group.AssetGroupCriteriaBuilderService;
import io.openbas.rest.asset_group.form.AssetGroupOutput;
import io.openbas.utils.TargetType;
import io.openbas.utils.pagination.SearchPaginationInput;
import io.openbas.utils.pagination.SortField;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TargetService {
  private final AssetGroupCriteriaBuilderService assetGroupCriteriaBuilderService;

  public Page<InjectTarget> injectTargets(
      TargetType injectTargetType, Inject inject, SearchPaginationInput input) {
    Page<InjectTarget> tgts;
    switch (injectTargetType) {
      case ASSETS_GROUPS:
        Filters.FilterGroup newFilterGroup =
            convertTargetFiltersToAssetGroupFilters(input.getFilterGroup(), inject);
        input.setFilterGroup(newFilterGroup);
        input.setSorts(List.of(new SortField("asset_group_name", "ASC")));
        Page<AssetGroupOutput> filteredAssetGroups =
            assetGroupCriteriaBuilderService.assetGroupPagination(input);
        Page<InjectTarget> filteredTargets =
            new PageImpl<>(
                filteredAssetGroups.getContent().stream()
                    .map(this::convertFromAssetGroupOutput)
                    .toList(),
                filteredAssetGroups.getPageable(),
                filteredAssetGroups.getTotalElements());
        tgts = filteredTargets;
        break;
      case ASSETS:
        tgts = null;
        break;
      case AGENT:
        tgts = null;
        break;
      case TEAMS:
        tgts = null;
        break;
      case PLAYER:
        tgts = null;
        break;
      default:
        throw new IllegalArgumentException("Unsupported target type: " + injectTargetType);
    }
    return tgts;
  }

  private InjectTarget convertFromAssetGroupOutput(AssetGroupOutput assetGroupOutput) {
    return new AssetGroupTarget(
        assetGroupOutput.getId(), assetGroupOutput.getName(), assetGroupOutput.getTags());
  }

  private Filters.FilterGroup convertTargetFiltersToAssetGroupFilters(
      Filters.FilterGroup filterGroup, Inject inject) {
    Filters.FilterGroup newFilterGroup = new Filters.FilterGroup();
    List<Filters.Filter> convertedFilters = new ArrayList<>();
    for (Filters.Filter filter : filterGroup.getFilters()) {
      Filters.Filter newFilter = new Filters.Filter();
      switch (filter.getKey()) {
        case "target_name":
          newFilter.setMode(filter.getMode());
          newFilter.setValues(filter.getValues());
          newFilter.setOperator(filter.getOperator());
          newFilter.setKey("asset_group_name");
          convertedFilters.add(newFilter);
          break;
        case "target_tags":
          newFilter.setMode(filter.getMode());
          newFilter.setValues(filter.getValues());
          newFilter.setOperator(filter.getOperator());
          newFilter.setKey("asset_group_tags");
          convertedFilters.add(newFilter);
          break;
        default:
          break; // ignore
      }
    }
    // add filter on inject
    Filters.Filter injectFilter = new Filters.Filter();
    injectFilter.setMode(Filters.FilterMode.and);
    injectFilter.setKey("asset_group_injects");
    injectFilter.setOperator(Filters.FilterOperator.eq);
    injectFilter.setValues(List.of(inject.getId()));
    convertedFilters.add(injectFilter);
    newFilterGroup.setFilters(convertedFilters);
    return newFilterGroup;
  }
}
