package io.openbas.service.targets;

import io.openbas.database.model.*;
import io.openbas.rest.asset_group.AssetGroupCriteriaBuilderService;
import io.openbas.rest.asset_group.form.AssetGroupOutput;
import io.openbas.service.targets.search.AssetGroupTargetSearchAdaptor;
import io.openbas.utils.TargetType;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TargetService {
  private final AssetGroupTargetSearchAdaptor assetGroupTargetSearchAdaptor;
  private final AssetGroupCriteriaBuilderService assetGroupCriteriaBuilderService;

  public Page<InjectTarget> injectTargets(
      TargetType injectTargetType, Inject inject, SearchPaginationInput input) {
    return switch (injectTargetType) {
      case ASSETS_GROUPS -> {
        Page<AssetGroupOutput> filteredAssetGroups =
            assetGroupCriteriaBuilderService.assetGroupPagination(
                assetGroupTargetSearchAdaptor.translate(input, inject));
        yield new PageImpl<>(
            filteredAssetGroups.getContent().stream()
                .map(this::convertFromAssetGroupOutput)
                .toList(),
            filteredAssetGroups.getPageable(),
            filteredAssetGroups.getTotalElements());
      }
      case ASSETS -> null;
      case AGENT -> null;
      case TEAMS -> null;
      case PLAYER -> null;
      default -> throw new IllegalArgumentException("Unsupported target type: " + injectTargetType);
    };
  }

  private InjectTarget convertFromAssetGroupOutput(AssetGroupOutput assetGroupOutput) {
    return new AssetGroupTarget(
        assetGroupOutput.getId(), assetGroupOutput.getName(), assetGroupOutput.getTags());
  }
}
