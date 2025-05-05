package io.openbas.service.targets.search;

import io.openbas.database.model.AssetGroupTarget;
import io.openbas.database.model.Inject;
import io.openbas.database.model.InjectTarget;
import io.openbas.rest.asset_group.AssetGroupCriteriaBuilderService;
import io.openbas.rest.asset_group.form.AssetGroupOutput;
import io.openbas.service.InjectExpectationService;
import io.openbas.utils.AtomicTestingUtils;
import io.openbas.utils.pagination.SearchPaginationInput;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

@Component
public class AssetGroupTargetSearchAdaptor extends SearchAdaptorBase {
  private final AssetGroupCriteriaBuilderService assetGroupCriteriaBuilderService;
  private final InjectExpectationService injectExpectationService;

  public AssetGroupTargetSearchAdaptor(
      AssetGroupCriteriaBuilderService assetGroupCriteriaBuilderService,
      InjectExpectationService injectExpectationService) {
    this.assetGroupCriteriaBuilderService = assetGroupCriteriaBuilderService;
    this.injectExpectationService = injectExpectationService;

    // field name translations
    this.fieldTranslations.put("target_name", "asset_group_name");
    this.fieldTranslations.put("target_tags", "asset_group_tags");
    this.fieldTranslations.put("target_injects", "asset_group_injects");
  }

  @Override
  public Page<InjectTarget> search(SearchPaginationInput input, Inject scopedInject) {
    Page<AssetGroupOutput> filteredAssetGroups =
        assetGroupCriteriaBuilderService.assetGroupPagination(this.translate(input, scopedInject));
    return new PageImpl<>(
        filteredAssetGroups.getContent().stream()
            .map(assetGroupOutput -> convertFromAssetGroupOutput(assetGroupOutput, scopedInject))
            .toList(),
        filteredAssetGroups.getPageable(),
        filteredAssetGroups.getTotalElements());
  }

  private InjectTarget convertFromAssetGroupOutput(
      AssetGroupOutput assetGroupOutput, Inject inject) {
    AssetGroupTarget target =
        new AssetGroupTarget(
            assetGroupOutput.getId(), assetGroupOutput.getName(), assetGroupOutput.getTags());

    List<AtomicTestingUtils.ExpectationResultsByType> results =
        AtomicTestingUtils.getExpectationResultByTypes(
            injectExpectationService.findExpectationsByInjectAndTargetAndTargetType(
                inject.getId(), target.getId(), "not applicable", target.getTargetType()));

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
