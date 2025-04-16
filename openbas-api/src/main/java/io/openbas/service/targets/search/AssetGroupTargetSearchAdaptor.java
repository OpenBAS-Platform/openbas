package io.openbas.service.targets.search;

import org.springframework.stereotype.Component;

@Component
public class AssetGroupTargetSearchAdaptor extends SearchAdaptorBase {
  public AssetGroupTargetSearchAdaptor() {
    this.fieldTranslations.put("target_name", "asset_group_name");
    this.fieldTranslations.put("target_tags", "asset_group_tags");
    this.fieldTranslations.put("target_injects", "asset_group_injects");
  }
}
