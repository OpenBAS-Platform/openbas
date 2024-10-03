package io.openbas.database.raw;

import java.util.List;

public interface RawAssetGroupForCompute {

    String getAsset_group_id();
    String getAsset_group_name();
    List<RawAsset> getAssets();
    List<RawAsset> getDynamicAssets();

}
