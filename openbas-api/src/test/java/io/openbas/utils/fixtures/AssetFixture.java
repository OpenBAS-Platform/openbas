package io.openbas.utils.fixtures;

import io.openbas.database.model.Asset;
import java.time.Instant;
import org.jetbrains.annotations.NotNull;

public class AssetFixture {
  public static Asset createDefaultAsset(@NotNull final String id) {
    Asset asset = new Asset();
    asset.setId(id);
    asset.setCreatedAt(Instant.now());
    asset.setUpdatedAt(Instant.now());
    asset.setName("asset name");
    asset.setDescription("asset description");
    return asset;
  }
}
