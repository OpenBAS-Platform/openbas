package io.openbas.database.raw;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Filters.FilterGroup;
import io.openbas.database.model.Tag;
import lombok.Data;

import java.util.List;

@Data
public class RawPaginationAssetGroup {

  String asset_group_id;
  String asset_group_name;
  String asset_group_description;
  List<String> asset_group_assets;
  FilterGroup asset_group_dynamic_filter;
  List<String> asset_group_tags;

  public RawPaginationAssetGroup(final AssetGroup assetGroup) {
    this.asset_group_id = assetGroup.getId();
    this.asset_group_name = assetGroup.getName();
    this.asset_group_description = assetGroup.getDescription();
    this.asset_group_assets = assetGroup.getAssets().stream().map(Asset::getId).toList();
    this.asset_group_dynamic_filter = assetGroup.getDynamicFilter();
    this.asset_group_tags = assetGroup.getTags().stream().map(Tag::getId).toList();
  }
}
