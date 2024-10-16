package io.openbas.utils.fixtures;

import io.openbas.database.model.AssetGroup;
import org.jetbrains.annotations.NotNull;

public class AssetGroupFixture {

  public static AssetGroup createDefaultAssetGroup(@NotNull final String name) {
    AssetGroup assetGroup = new AssetGroup();
    assetGroup.setName(name);
    assetGroup.setDescription("An asset group");
    return assetGroup;
  }

}
