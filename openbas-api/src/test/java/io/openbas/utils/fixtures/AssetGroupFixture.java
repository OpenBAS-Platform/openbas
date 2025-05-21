package io.openbas.utils.fixtures;

import io.openbas.database.model.Asset;
import io.openbas.database.model.AssetGroup;
import io.openbas.database.model.Filters;
import io.openbas.rest.asset_group.form.AssetGroupInput;
import java.util.List;
import org.jetbrains.annotations.NotNull;

public class AssetGroupFixture {

  public static AssetGroup createDefaultAssetGroup(@NotNull final String name) {
    AssetGroup assetGroup = new AssetGroup();
    assetGroup.setName(name);
    assetGroup.setDescription("An asset group");
    return assetGroup;
  }

  public static AssetGroupInput createAssetGroupWithTags(
      @NotNull final String name, @NotNull final List<String> tagIds) {
    AssetGroupInput assetGroupInput = new AssetGroupInput();
    assetGroupInput.setName(name);
    assetGroupInput.setDescription("An asset group");
    assetGroupInput.setTagIds(tagIds);
    return assetGroupInput;
  }

  public static AssetGroupInput createAssetGroupWithDynamicFilters(
      @NotNull final String name, @NotNull final Filters.FilterGroup dynamicFilter) {
    AssetGroupInput assetGroupInput = new AssetGroupInput();
    assetGroupInput.setName(name);
    assetGroupInput.setDescription("An asset group");
    assetGroupInput.setDynamicFilter(dynamicFilter);
    return assetGroupInput;
  }

  public static AssetGroup createAssetGroupWithAssets(
      @NotNull final String name, List<Asset> assets) {
    AssetGroup assetGroup = new AssetGroup();
    assetGroup.setName(name);
    assetGroup.setDescription("An asset group");
    assetGroup.setAssets(assets);
    return assetGroup;
  }
}
