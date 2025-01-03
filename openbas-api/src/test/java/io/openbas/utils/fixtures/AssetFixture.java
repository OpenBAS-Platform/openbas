package io.openbas.utils.fixtures;

import io.openbas.database.model.Asset;
import org.jetbrains.annotations.NotNull;

public class AssetFixture {
  public static Asset createDefaultAsset(@NotNull final String id) {
    Asset assetGroup = new Asset();
    assetGroup.setId(id);
    return assetGroup;
  }
}
